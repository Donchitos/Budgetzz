import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { AlertRule, BillDueTiming, Notification as ClientNotification } from "../../src/types/alerts";
import { Budget, RecurringTransaction, Transaction } from "../../src/types";
import { FinancialGoal } from "../../src/types/goals";

// Main function to be scheduled, responsible for running the alert engine daily.
export const runAlertEngine = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  const startTime = new Date();
  functions.logger.info("Alert engine run started.", { timestamp: context.timestamp });

  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  try {
    // 1. Fetch all active alert rules
    const rulesSnapshot = await db.collection("alertRules").where("isEnabled", "==", true).get();
    
    if (rulesSnapshot.empty) {
      functions.logger.info("No active alert rules found. Ending run.");
      return null;
    }

    const rules = rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertRule));
    functions.logger.info(`Found ${rules.length} active alert rules to evaluate.`);

    const evaluationPromises = rules.map(rule =>
      evaluateRule(rule, db, now).catch(error => {
        functions.logger.error(`Unhandled error evaluating rule ${rule.id}:`, error, { rule });
        return null; // Ensure Promise.all continues
      })
    );

    await Promise.all(evaluationPromises);

    const duration = new Date().getTime() - startTime.getTime();
    functions.logger.info(`Alert engine run finished in ${duration}ms. Evaluated ${rules.length} rules.`);
  } catch (error) {
    functions.logger.error("Fatal error during alert engine run:", error);
  }
  
  return null;
});

/**
 * Evaluates a single alert rule based on its type.
 * @param {AlertRule} rule The alert rule to evaluate.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {admin.firestore.Timestamp} now The current timestamp.
 */
async function evaluateRule(rule: AlertRule, db: admin.firestore.Firestore, now: admin.firestore.Timestamp): Promise<void> {
  functions.logger.info(`Evaluating rule ${rule.id} of type ${rule.alertType} for user ${rule.userId}.`);
  
  try {
    switch (rule.alertType) {
      case "BUDGET_THRESHOLD":
        await evaluateBudgetThreshold(rule, db);
        break;
      case "BILL_DUE":
        await evaluateBillDue(rule, db, now);
        break;
      case "GOAL_PROGRESS":
        await evaluateGoalProgress(rule, db, now);
        break;
      case "UNUSUAL_SPENDING":
        // This type is handled by a separate, event-driven function as per architecture.
        functions.logger.info(`Skipping 'UNUSUAL_SPENDING' rule ${rule.id} as it's handled elsewhere.`);
        break;
      default:
        functions.logger.warn(`Unknown alert type for rule ${rule.id}: ${rule.alertType}.`);
    }
  } catch (error) {
    functions.logger.error(`Error processing rule ${rule.id}:`, error, { rule });
    // Do not rethrow, to allow other rules to be processed.
  }
}

/**
 * Evaluates if a budget's spending has exceeded a defined threshold.
 * @param {AlertRule} rule The budget threshold rule.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 */
async function evaluateBudgetThreshold(rule: AlertRule, db: admin.firestore.Firestore): Promise<void> {
  if (!rule.budgetId || typeof rule.threshold !== 'number') {
    functions.logger.warn(`Rule ${rule.id} is missing 'budgetId' or has an invalid 'threshold'.`, { rule });
    return;
  }

  const budgetDoc = await db.collection("budgets").doc(rule.budgetId).get();
  if (!budgetDoc.exists) {
    functions.logger.warn(`Budget document ${rule.budgetId} not found for rule ${rule.id}.`);
    return;
  }
  const budget = budgetDoc.data() as Budget;

  // Define the date range for the budget period
  const startDate = new Date(budget.year, budget.month - 1, 1);
  const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59); // End of the last day of the month

  const transactionsSnapshot = await db.collection("transactions")
    .where("userId", "==", rule.userId)
    .where("category", "==", budget.category)
    .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
    .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(endDate))
    .get();

  const totalSpent = transactionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Transaction).amount, 0);
  
  if (budget.budgetAmount <= 0) {
    functions.logger.info(`Budget amount for ${budget.category} is zero or less, skipping threshold check.`);
    return;
  }

  const percentageSpent = (totalSpent / budget.budgetAmount) * 100;

  if (percentageSpent >= rule.threshold) {
    const title = "Budget Alert";
    const body = `You've spent ${percentageSpent.toFixed(0)}% of your ${budget.category} budget for this month ($${totalSpent.toFixed(2)} / $${budget.budgetAmount.toFixed(2)}).`;
    await createNotification(rule, title, body, db);
  }
}

/**
 * Evaluates if a bill is due based on the rule's timing.
 * @param {AlertRule} rule The bill due rule.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {admin.firestore.Timestamp} now The current timestamp.
 */
async function evaluateBillDue(rule: AlertRule, db: admin.firestore.Firestore, now: admin.firestore.Timestamp): Promise<void> {
  if (!rule.recurringTransactionId || !rule.timing) {
    functions.logger.warn(`Rule ${rule.id} is missing 'recurringTransactionId' or 'timing'.`, { rule });
    return;
  }

  const recurringDoc = await db.collection("recurringTransactions").doc(rule.recurringTransactionId).get();
  if (!recurringDoc.exists) {
    functions.logger.warn(`Recurring transaction ${rule.recurringTransactionId} not found for rule ${rule.id}.`);
    return;
  }
  const bill = recurringDoc.data() as RecurringTransaction;

  if (!bill.nextDueDate) {
    functions.logger.warn(`Recurring transaction ${bill.description} is missing 'nextDueDate'.`, { bill });
    return;
  }

  const nextDueDate = (bill.nextDueDate as admin.firestore.Timestamp).toDate();
  const daysUntilDue = (nextDueDate.getTime() - now.toDate().getTime()) / (1000 * 60 * 60 * 24);

  const timingMap: Record<BillDueTiming, number> = {
    'ON_DUE_DATE': 0,
    '1_DAY_BEFORE': 1,
    '3_DAYS_BEFORE': 3,
    '7_DAYS_BEFORE': 7,
  };

  const alertDays = timingMap[rule.timing];
  
  // Check if the due date is exactly the configured number of days away.
  if (daysUntilDue >= alertDays && daysUntilDue < alertDays + 1) {
    const title = "Upcoming Bill Reminder";
    const body = `Your bill, "${bill.description}", for $${bill.amount.toFixed(2)} is due in ${alertDays} day(s).`;
    await createNotification(rule, title, body, db);
  }
}

/**
 * Evaluates the progress of a financial goal for milestones and approaching deadlines.
 * @param {AlertRule} rule The goal progress rule.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {admin.firestore.Timestamp} now The current timestamp.
 */
async function evaluateGoalProgress(rule: AlertRule, db: admin.firestore.Firestore, now: admin.firestore.Timestamp): Promise<void> {
  if (!rule.goalId) {
    functions.logger.warn(`Rule ${rule.id} is missing 'goalId'.`, { rule });
    return;
  }

  const goalDocRef = db.collection("financialGoals").doc(rule.goalId);
  const goalDoc = await goalDocRef.get();

  if (!goalDoc.exists) {
    functions.logger.warn(`Financial goal ${rule.goalId} not found for rule ${rule.id}.`);
    return;
  }
  const goal = goalDoc.data() as FinancialGoal;

  // --- Milestone Check ---
  // To prevent re-notifying, we track the last notified milestone in the goal itself.
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const milestones: number[] = [25, 50, 75, 100];
  const lastNotifiedMilestone = goal.lastNotifiedMilestone || 0;

  let nextMilestone: number | null = null;
  for (const milestone of milestones) {
    if (progressPercentage >= milestone && lastNotifiedMilestone < milestone) {
      nextMilestone = milestone;
      break; // Find the next milestone to notify about
    }
  }

  if (nextMilestone) {
    const title = nextMilestone === 100 ? "Goal Reached!" : `Goal Milestone: ${nextMilestone}%`;
    const body = `You've reached ${nextMilestone}% of your goal "${goal.title}". Keep it up!`;
    await createNotification(rule, title, body, db);
    // Update the goal to prevent re-notification for this milestone
    await goalDocRef.update({ lastNotifiedMilestone: nextMilestone });
  }

  // --- Deadline Check ---
  if (goal.targetDate) {
    const targetDate = new Date(goal.targetDate);
    const daysUntilDeadline = (targetDate.getTime() - now.toDate().getTime()) / (1000 * 60 * 60 * 24);

    // Notify if the deadline is within 7 days and we haven't notified about it yet.
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 7 && !goal.deadlineNotified) {
      const title = "Goal Deadline Approaching";
      const body = `Your goal "${goal.title}" is due in ${Math.ceil(daysUntilDeadline)} days. You've saved ${progressPercentage.toFixed(0)}%.`;
      await createNotification(rule, title, body, db);
      // Mark that the deadline notification has been sent
      await goalDocRef.update({ deadlineNotified: true });
    }
  }
}

/**
 * Creates a new notification document in Firestore.
 * @param {AlertRule} rule The rule that triggered the notification.
 * @param {string} title The title of the notification.
 * @param {string} body The body content of the notification.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 */
async function createNotification(rule: AlertRule, title: string, body: string, db: admin.firestore.Firestore): Promise<void> {
  const notificationPayload: Omit<ClientNotification, 'id' | 'createdAt'> & { createdAt: admin.firestore.Timestamp } = {
    userId: rule.userId,
    alertRuleId: rule.id,
    content: { title, body },
    status: {
      delivery: 'pending',
      email: 'pending',
      push: 'pending',
      inApp: 'pending',
      seen: false,
      dismissed: false,
    },
    isArchived: false,
    createdAt: admin.firestore.Timestamp.now(),
  };

  try {
    const notificationRef = await db.collection("notifications").add(notificationPayload);
    functions.logger.info(`Successfully created notification ${notificationRef.id} for rule ${rule.id}.`);
  } catch (error) {
    functions.logger.error(`Failed to create notification for rule ${rule.id}:`, error, { rule });
    // Rethrow to be caught by the individual rule evaluator's catch block
    throw error;
  }
}
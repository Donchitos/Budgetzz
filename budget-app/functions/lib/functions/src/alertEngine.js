"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAlertEngine = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Main function to be scheduled.
exports.runAlertEngine = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    functions.logger.info("Starting alert engine run.", { timestamp: context.timestamp });
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    // 1. Fetch all active alert rules
    const rulesSnapshot = await db.collection("alertRules").where("isEnabled", "==", true).get();
    if (rulesSnapshot.empty) {
        functions.logger.info("No active alert rules to evaluate.");
        return null;
    }
    const rules = rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const evaluationPromises = rules.map(rule => evaluateRule(rule, db, now).catch(error => {
        functions.logger.error(`Error evaluating rule ${rule.id}:`, error);
    }));
    await Promise.all(evaluationPromises);
    functions.logger.info(`Finished evaluating ${rules.length} alert rules.`);
    return null;
});
async function evaluateRule(rule, db, now) {
    functions.logger.info(`Evaluating rule ${rule.id} of type ${rule.alertType} for user ${rule.userId}`);
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
            // This is handled by a separate, event-driven function as per architecture.
            break;
        default:
            functions.logger.warn(`Unknown alert type for rule ${rule.id}: ${rule.alertType}`);
    }
}
async function evaluateBudgetThreshold(rule, db) {
    if (!rule.budgetId || !rule.threshold) {
        functions.logger.warn(`Rule ${rule.id} is missing budgetId or threshold.`);
        return;
    }
    const budgetDoc = await db.collection("budgets").doc(rule.budgetId).get();
    if (!budgetDoc.exists) {
        functions.logger.warn(`Budget ${rule.budgetId} for rule ${rule.id} not found.`);
        return;
    }
    const budget = budgetDoc.data();
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0);
    const transactionsSnapshot = await db.collection("transactions")
        .where("userId", "==", rule.userId)
        .where("category", "==", budget.category)
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", endDate)
        .get();
    const totalSpent = transactionsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
    const percentageSpent = (totalSpent / budget.budgetAmount) * 100;
    if (percentageSpent >= rule.threshold) {
        const title = "Budget Threshold Reached";
        const body = `You have spent ${percentageSpent.toFixed(0)}% of your ${budget.category} budget for this month.`;
        await createNotification(rule, title, body, db);
    }
}
async function evaluateBillDue(rule, db, now) {
    if (!rule.recurringTransactionId || !rule.timing) {
        functions.logger.warn(`Rule ${rule.id} is missing recurringTransactionId or timing.`);
        return;
    }
    const recurringDoc = await db.collection("recurringTransactions").doc(rule.recurringTransactionId).get();
    if (!recurringDoc.exists) {
        functions.logger.warn(`Recurring transaction ${rule.recurringTransactionId} for rule ${rule.id} not found.`);
        return;
    }
    const bill = recurringDoc.data();
    const nextDueDate = bill.nextDueDate.toDate();
    const daysUntilDue = (nextDueDate.getTime() - now.toDate().getTime()) / (1000 * 60 * 60 * 24);
    const timingMap = {
        'ON_DUE_DATE': 0,
        '1_DAY_BEFORE': 1,
        '3_DAYS_BEFORE': 3,
        '7_DAYS_BEFORE': 7,
    };
    const alertDays = timingMap[rule.timing];
    if (Math.floor(daysUntilDue) === alertDays) {
        const title = "Upcoming Bill Reminder";
        const body = `Your bill "${bill.description}" for $${bill.amount} is due in ${alertDays} day(s).`;
        await createNotification(rule, title, body, db);
    }
}
async function evaluateGoalProgress(rule, db, now) {
    if (!rule.goalId) {
        functions.logger.warn(`Rule ${rule.id} is missing goalId.`);
        return;
    }
    const goalDoc = await db.collection("financialGoals").doc(rule.goalId).get();
    if (!goalDoc.exists) {
        functions.logger.warn(`Goal ${rule.goalId} for rule ${rule.id} not found.`);
        return;
    }
    const goal = goalDoc.data();
    // Milestone Check
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    const milestones = [25, 50, 75];
    for (const milestone of milestones) {
        // Simple check: has it passed the milestone? A more robust check would prevent re-notifying.
        if (progressPercentage >= milestone) {
            // This check needs state to avoid sending notifications every day after a milestone is hit.
            // For now, we'll assume a simple check is sufficient for the initial implementation.
        }
    }
    // Deadline Check
    const targetDate = new Date(goal.targetDate);
    const daysUntilDeadline = (targetDate.getTime() - now.toDate().getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
        const title = "Goal Deadline Approaching";
        const body = `Your goal "${goal.title}" is due in ${Math.ceil(daysUntilDeadline)} days. You've saved ${progressPercentage.toFixed(0)}%.`;
        await createNotification(rule, title, body, db);
    }
}
async function createNotification(rule, title, body, db) {
    const notification = {
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
    await db.collection("notifications").add(notification);
    functions.logger.info(`Created notification for rule ${rule.id}`);
}
//# sourceMappingURL=alertEngine.js.map
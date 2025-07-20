import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// This function assumes Firebase is initialized elsewhere
// For example, in your main index.ts file: admin.initializeApp();

interface Transaction {
  amount: number;
  category?: string;
  createdAt: admin.firestore.Timestamp;
}

interface BudgetRecommendation {
  category: string;
  recommendedAmount: number;
}

export const generateBudgetRecommendations = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const userId = request.auth.uid;
  const lookbackMonths = request.data.months || 3; // Default to 3 months of history

  try {
    const db = admin.firestore();
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - lookbackMonths,
      1
    );

    const transactionsSnapshot = await db
      .collection("transactions") // FIX: Changed from 'expenses' to 'transactions'
      .where("userId", "==", userId)
      .where("createdAt", ">=", startDate)
      .get();

    if (transactionsSnapshot.empty) {
      return { recommendations: [] };
    }

    const categorySpending: { [key: string]: number[] } = {};

    transactionsSnapshot.forEach((doc) => {
      const transaction = doc.data() as Transaction;
      if (transaction.category) {
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = [];
        }
        categorySpending[transaction.category].push(transaction.amount);
      }
    });

    const recommendations: BudgetRecommendation[] = Object.keys(
      categorySpending
    ).map((category) => {
      const spendings = categorySpending[category];
      const averageSpend =
        spendings.reduce((a, b) => a + b, 0) / lookbackMonths;
      // Round up to nearest $10 for cleaner, safer suggestions
      const recommendedAmount = Math.ceil(averageSpend / 10) * 10;

      return { category, recommendedAmount };
    });

    return { recommendations };
  } catch (error) {
    console.error("Error generating budget recommendations:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate budget recommendations."
    );
  }
});
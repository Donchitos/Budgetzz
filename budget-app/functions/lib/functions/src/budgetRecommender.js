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
exports.generateBudgetRecommendations = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Generates personalized budget recommendations for a user based on their past transaction history.
 *
 * This callable function analyzes a user's expenses over a specified number of months (defaulting to 3)
 * to calculate the average monthly spending for each category. It then suggests a rounded budget amount
 * for each category with significant spending.
 *
 * @param {object} data The data passed to the function, expecting an optional `months` property.
 * @param {number} [data.months=3] The number of past months to analyze for spending history.
 * @param {functions.https.CallableContext} context The context of the function call, including authentication details.
 * @returns {Promise<{recommendations: BudgetRecommendation[]}>} A promise that resolves with an object containing a list of budget recommendations.
 * @throws {functions.https.HttpsError} Throws 'unauthenticated' if the user is not logged in.
 * @throws {functions.https.HttpsError} Throws 'internal' for any server-side errors.
 */
exports.generateBudgetRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userId = context.auth.uid;
    const lookbackMonths = data.months || 3;
    functions.logger.info(`Generating budget recommendations for user ${userId} with a ${lookbackMonths}-month lookback.`);
    try {
        const db = admin.firestore();
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - lookbackMonths, 1);
        const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .where('type', '==', 'expense') // Ensure we only look at expenses
            .where('createdAt', '>=', startTimestamp)
            .get();
        if (transactionsSnapshot.empty) {
            functions.logger.info(`No transactions found for user ${userId} in the last ${lookbackMonths} months.`);
            return { recommendations: [] };
        }
        // Group total spending by category
        const categorySpending = {};
        transactionsSnapshot.forEach(doc => {
            const transaction = doc.data();
            if (transaction.category) {
                if (!categorySpending[transaction.category]) {
                    categorySpending[transaction.category] = 0;
                }
                categorySpending[transaction.category] += transaction.amount;
            }
        });
        const recommendations = Object.entries(categorySpending)
            .map(([category, totalSpend]) => {
            const averageMonthlySpend = totalSpend / lookbackMonths;
            // Round to the nearest $10 for cleaner, more practical suggestions
            const recommendedAmount = Math.round(averageMonthlySpend / 10) * 10;
            // Only recommend budgets for significant categories
            if (recommendedAmount > 0) {
                return { category, recommendedAmount };
            }
            return null;
        })
            .filter((rec) => rec !== null);
        functions.logger.info(`Successfully generated ${recommendations.length} recommendations for user ${userId}.`);
        return { recommendations };
    }
    catch (error) {
        functions.logger.error("Error generating budget recommendations for user:", userId, error);
        throw new functions.https.HttpsError('internal', 'Failed to generate budget recommendations. Please try again later.');
    }
});
//# sourceMappingURL=budgetRecommender.js.map
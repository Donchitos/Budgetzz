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
exports.generateBudgetRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userId = context.auth.uid;
    const lookbackMonths = data.months || 3; // Default to 3 months of history
    try {
        const db = admin.firestore();
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - lookbackMonths, 1);
        const transactionsSnapshot = await db.collection('expenses')
            .where('userId', '==', userId)
            .where('createdAt', '>=', startDate)
            .get();
        if (transactionsSnapshot.empty) {
            return { recommendations: [] };
        }
        const categorySpending = {};
        transactionsSnapshot.forEach(doc => {
            const transaction = doc.data();
            if (transaction.category) {
                if (!categorySpending[transaction.category]) {
                    categorySpending[transaction.category] = [];
                }
                categorySpending[transaction.category].push(transaction.amount);
            }
        });
        const recommendations = Object.keys(categorySpending).map(category => {
            const spendings = categorySpending[category];
            const averageSpend = spendings.reduce((a, b) => a + b, 0) / lookbackMonths;
            // Round to nearest $10 for cleaner suggestions
            const recommendedAmount = Math.round(averageSpend / 10) * 10;
            return { category, recommendedAmount };
        });
        return { recommendations };
    }
    catch (error) {
        console.error("Error generating budget recommendations:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate budget recommendations.');
    }
});
//# sourceMappingURL=budgetRecommender.js.map
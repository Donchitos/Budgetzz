// src/services/api.ts
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { generateBudgetId, getCurrentMonth } from "../utils/dateUtils";
import { calculateNextDueDate } from "../types/recurringUtils";
import type { RecurringTransaction, FrequencyType } from "../types";
import type { AlertRule, UserNotificationPreference } from "../types/alerts";

// Transactions
export const addTransaction = async (
  collectionName: "income" | "expenses",
  description: string,
  amount: number,
  category?: string,
  recurringId?: string
) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const collectionRef = collection(db, collectionName);
  await addDoc(collectionRef, {
    description,
    amount,
    category,
    createdAt: serverTimestamp(),
    userId: auth.currentUser.uid,
    recurringId: recurringId || null,
  });
};

export const deleteTransaction = async (
  collectionName: "income" | "expenses",
  id: string
) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Budgets
export const setBudget = async (
  category: string,
  budgetAmount: number,
  period: Date
) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const budgetId = generateBudgetId(auth.currentUser.uid, category, period);
  const budgetDocRef = doc(db, "budgets", budgetId);
  await setDoc(budgetDocRef, {
    category,
    budgetAmount,
    userId: auth.currentUser.uid,
    month: period.getMonth(),
    year: period.getFullYear(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteBudget = async (id: string) => {
  const budgetDocRef = doc(db, "budgets", id);
  await deleteDoc(budgetDocRef);
};

export const addBudget = async (category: string, budgetAmount: number, month: number, year: number) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const budgetId = generateBudgetId(auth.currentUser.uid, category, new Date(year, month - 1));
  const budgetDocRef = doc(db, "budgets", budgetId);
  await setDoc(budgetDocRef, {
    category,
    budgetAmount,
    userId: auth.currentUser.uid,
    month: month - 1,
    year,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Recurring Transactions
export const createRecurringTransaction = async (
  type: 'income' | 'expense',
  description: string,
  amount: number,
  frequency: FrequencyType,
  startDate: Date,
  category?: string,
  endDate?: Date
) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const recurringRef = collection(db, 'recurring-transactions');
  const nextDueDate = calculateNextDueDate(startDate, frequency);
  
  await addDoc(recurringRef, {
    type,
    description,
    amount,
    category: type === 'expense' ? category : undefined,
    frequency,
    startDate,
    endDate: endDate || null,
    isActive: true,
    nextDueDate,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateRecurringTransaction = async (
  id: string,
  updates: Partial<RecurringTransaction>
) => {
  const recurringDocRef = doc(db, 'recurring-transactions', id);
  await updateDoc(recurringDocRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteRecurringTransaction = async (id: string) => {
  const recurringDocRef = doc(db, 'recurring-transactions', id);
  await deleteDoc(recurringDocRef);
};

export const toggleRecurringTransactionStatus = async (id: string, isActive: boolean) => {
  await updateRecurringTransaction(id, { isActive });
};

export const updateRecurringTransactionNextDue = async (id: string, nextDueDate: Date) => {
  await updateRecurringTransaction(id, { nextDueDate });
};

// Generate transaction from recurring template
export const generateTransactionFromRecurring = async (recurringTransaction: RecurringTransaction) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const collectionName = recurringTransaction.type === 'income' ? 'income' : 'expenses';
  
  // Add the transaction
  await addTransaction(
    collectionName,
    recurringTransaction.description,
    recurringTransaction.amount,
    recurringTransaction.category,
    recurringTransaction.id
  );
  
  // Update the recurring transaction's next due date
  const currentDueDate = recurringTransaction.nextDueDate instanceof Date 
    ? recurringTransaction.nextDueDate 
    : recurringTransaction.nextDueDate.toDate();
    
  const nextDueDate = calculateNextDueDate(currentDueDate, recurringTransaction.frequency);
  
  await updateRecurringTransactionNextDue(recurringTransaction.id, nextDueDate);
};

// Bulk operations
export const generateMultipleTransactionsFromRecurring = async (
  recurringTransactions: RecurringTransaction[]
) => {
  for (const recurring of recurringTransactions) {
    await generateTransactionFromRecurring(recurring);
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

// Get transactions linked to a recurring transaction
export const getTransactionsFromRecurring = async (recurringId: string) => {
  if (!auth.currentUser) return { income: [], expenses: [] };
  
  const incomeQuery = query(
    collection(db, 'income'),
    where('userId', '==', auth.currentUser.uid),
    where('recurringId', '==', recurringId)
  );
  
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('userId', '==', auth.currentUser.uid),
    where('recurringId', '==', recurringId)
  );
  
  const [incomeSnapshot, expensesSnapshot] = await Promise.all([
    getDocs(incomeQuery),
    getDocs(expensesQuery)
  ]);
  
  const income = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return { income, expenses };
};

// Skip a recurring transaction (update next due without creating transaction)
export const skipRecurringTransaction = async (recurringTransaction: RecurringTransaction) => {
  const currentDueDate = recurringTransaction.nextDueDate instanceof Date 
    ? recurringTransaction.nextDueDate 
    : recurringTransaction.nextDueDate.toDate();
    
  const nextDueDate = calculateNextDueDate(currentDueDate, recurringTransaction.frequency);
  await updateRecurringTransactionNextDue(recurringTransaction.id, nextDueDate);
};

// Auto-generate all due transactions (for automation)
export const autoGenerateAllDueTransactions = async () => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  // Get all active recurring transactions for the user
  const recurringQuery = query(
    collection(db, 'recurring-transactions'),
    where('userId', '==', auth.currentUser.uid),
    where('isActive', '==', true)
  );
  
  const recurringSnapshot = await getDocs(recurringQuery);
  const allRecurring = recurringSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringTransaction));
  
  // Filter for due transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueTransactions = allRecurring.filter(rt => {
    const nextDueDate = rt.nextDueDate instanceof Date 
      ? rt.nextDueDate 
      : rt.nextDueDate.toDate();
    nextDueDate.setHours(0, 0, 0, 0);
    
    // Check if not ended
    if (rt.endDate) {
      const endDate = rt.endDate instanceof Date ? rt.endDate : rt.endDate.toDate();
      if (today > endDate) return false;
    }
    
    return nextDueDate <= today;
  });
  
  // Generate transactions for all due recurring transactions
  await generateMultipleTransactionsFromRecurring(dueTransactions);
  
  return dueTransactions.length;
};

// Alert Rules
export const addAlertRule = async (rule: Omit<AlertRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const collectionRef = collection(db, "alertRules");
  await addDoc(collectionRef, {
    ...rule,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateAlertRule = async (id: string, updates: Partial<AlertRule>) => {
  const docRef = doc(db, "alertRules", id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteAlertRule = async (id: string) => {
  const docRef = doc(db, "alertRules", id);
  await deleteDoc(docRef);
};

// Notification Preferences
export const getUserNotificationPreferences = async (): Promise<UserNotificationPreference | null> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const docRef = doc(db, "userNotificationPreferences", auth.currentUser.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserNotificationPreference;
  }
  return null;
};

export const setUserNotificationPreferences = async (preferences: Partial<UserNotificationPreference>) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const docRef = doc(db, "userNotificationPreferences", auth.currentUser.uid);
  await setDoc(docRef, {
    ...preferences,
    userId: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
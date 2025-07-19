import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { generateBudgetId } from "../utils/dateUtils";

// Transactions
export const addTransaction = async (
  collectionName: "income" | "expenses",
  description: string,
  amount: number,
  category?: string
) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const collectionRef = collection(db, collectionName);
  await addDoc(collectionRef, {
    description,
    amount,
    category,
    createdAt: serverTimestamp(),
    userId: auth.currentUser.uid,
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
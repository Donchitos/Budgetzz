// src/features/recurring/DueTransactionsReview.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import {
  getDueRecurringTransactions,
  calculateNextDueDate,
  generateTransactionFromRecurring,
  formatFrequency,
  calculateMissedOccurrences
} from '../../types/recurringUtils';
import type { RecurringTransaction } from '../../types';

function DueTransactionsReview() {
  const { snapshot: recurringSnapshot, loading, error } = useFirestoreCollection('recurring-transactions');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [dueTransactions, setDueTransactions] = useState<RecurringTransaction[]>([]);

  // Calculate due transactions when data loads
  useEffect(() => {
    if (recurringSnapshot) {
      const allRecurring = recurringSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RecurringTransaction));
      
      const due = getDueRecurringTransactions(allRecurring);
      setDueTransactions(due);
    }
  }, [recurringSnapshot]);

  const handleGenerateTransaction = async (recurringTransaction: RecurringTransaction) => {
    if (!auth.currentUser) return;
    
    setProcessingIds(prev => new Set(prev).add(recurringTransaction.id));
    
    try {
      // Generate the actual transaction
      const transactionData = generateTransactionFromRecurring(recurringTransaction);
      
      // Add to appropriate collection (income or expenses)
      const collectionName = recurringTransaction.type === 'income' ? 'income' : 'expenses';
      await addDoc(collection(db, collectionName), {
        ...transactionData,
        createdAt: serverTimestamp()
      });

      // Update the recurring transaction's next due date
      const nextDueDate = calculateNextDueDate(
        recurringTransaction.nextDueDate instanceof Date 
          ? recurringTransaction.nextDueDate 
          : recurringTransaction.nextDueDate.toDate(),
        recurringTransaction.frequency
      );

      await updateDoc(doc(db, 'recurring-transactions', recurringTransaction.id), {
        nextDueDate: nextDueDate,
        updatedAt: serverTimestamp()
      });

      // Remove from due transactions list
      setDueTransactions(prev => prev.filter(rt => rt.id !== recurringTransaction.id));
      
    } catch (err) {
      console.error("Error generating transaction: ", err);
      alert("Error generating transaction. Please try again.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recurringTransaction.id);
        return newSet;
      });
    }
  };

  const handleGenerateAllDue = async () => {
    if (dueTransactions.length === 0) return;
    
    const confirmMessage = `Generate ${dueTransactions.length} due transaction${dueTransactions.length !== 1 ? 's' : ''}?`;
    if (!window.confirm(confirmMessage)) return;

    for (const transaction of dueTransactions) {
      await handleGenerateTransaction(transaction);
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleSkipTransaction = async (recurringTransaction: RecurringTransaction) => {
    if (!window.confirm(`Skip this occurrence of "${recurringTransaction.description}"?`)) return;
    
    setProcessingIds(prev => new Set(prev).add(recurringTransaction.id));
    
    try {
      // Just update the next due date without creating a transaction
      const nextDueDate = calculateNextDueDate(
        recurringTransaction.nextDueDate instanceof Date 
          ? recurringTransaction.nextDueDate 
          : recurringTransaction.nextDueDate.toDate(),
        recurringTransaction.frequency
      );

      await updateDoc(doc(db, 'recurring-transactions', recurringTransaction.id), {
        nextDueDate: nextDueDate,
        updatedAt: serverTimestamp()
      });

      // Remove from due transactions list
      setDueTransactions(prev => prev.filter(rt => rt.id !== recurringTransaction.id));
      
    } catch (err) {
      console.error("Error skipping transaction: ", err);
      alert("Error skipping transaction. Please try again.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recurringTransaction.id);
        return newSet;
      });
    }
  };

  const formatDueDate = (dueDate: any) => {
    const date = dueDate?.toDate ? dueDate.toDate() : new Date(dueDate);
    const today = new Date();
    
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due yesterday';
    if (diffDays > 1) return `${diffDays} days overdue`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card title="Due Recurring Transactions">
        <div className="p-4">
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-16 w-full mb-4" />
        </div>
      </Card>
    );
  }
  if (error) return <p>Error loading due transactions.</p>;

  return (
    <Card title="Due Recurring Transactions">
      {dueTransactions.length === 0 ? (
        <div className="text-center p-8 text-gray-600">
          <div className="text-4xl mb-2">✅</div>
          <h4 className="mb-1">All caught up!</h4>
          <p className="m-0 text-sm">
            No recurring transactions are due at the moment.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-5 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
            <div>
              <strong className="text-yellow-800">
                {dueTransactions.length} transaction{dueTransactions.length !== 1 ? 's' : ''} due
              </strong>
              <div className="text-sm text-yellow-800 mt-1">
                Review and add them to your transactions
              </div>
            </div>
            
            {dueTransactions.length > 1 && (
              <Button
                onClick={handleGenerateAllDue}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Generate All ({dueTransactions.length})
              </Button>
            )}
          </div>

          <div>
            {dueTransactions.map(transaction => {
              const isProcessing = processingIds.has(transaction.id);
              const missedCount = calculateMissedOccurrences(transaction);
              
              return (
                <div
                  key={transaction.id}
                  className={`p-4 mb-4 bg-gray-50 border rounded-lg ${
                    transaction.type === 'income' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`m-0 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.description}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong className="text-base">${transaction.amount.toFixed(2)}</strong>
                        {transaction.category && ` • ${transaction.category}`}
                        {` • ${formatFrequency(transaction.frequency)}`}
                      </div>
                      
                      <div className="text-xs text-red-600 font-bold">
                        {formatDueDate(transaction.nextDueDate)}
                        {missedCount > 1 && ` (${missedCount} occurrences behind)`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateTransaction(transaction)}
                        disabled={isProcessing}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2"
                      >
                        {isProcessing ? 'Adding...' : 'Add Transaction'}
                      </Button>
                      
                      <Button
                        onClick={() => handleSkipTransaction(transaction)}
                        disabled={isProcessing}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2"
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                  
                  {missedCount > 1 && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                      💡 This transaction has {missedCount} missed occurrences.
                      Consider generating them manually or adjusting the due date.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

export default DueTransactionsReview;
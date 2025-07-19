// src/features/recurring/DueTransactionsReview.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import Button from '../../components/Button';
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

  if (loading) return <p>Loading due transactions...</p>;
  if (error) return <p>Error loading due transactions.</p>;

  return (
    <Card title="Due Recurring Transactions">
      {dueTransactions.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '30px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>✅</div>
          <h4 style={{ marginBottom: '5px' }}>All caught up!</h4>
          <p style={{ margin: 0, fontSize: '0.9em' }}>
            No recurring transactions are due at the moment.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <div>
              <strong style={{ color: '#856404' }}>
                {dueTransactions.length} transaction{dueTransactions.length !== 1 ? 's' : ''} due
              </strong>
              <div style={{ fontSize: '0.9em', color: '#856404', marginTop: '2px' }}>
                Review and add them to your transactions
              </div>
            </div>
            
            {dueTransactions.length > 1 && (
              <Button 
                onClick={handleGenerateAllDue}
                style={{ backgroundColor: '#28a745' }}
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
                  style={{ 
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${transaction.type === 'income' ? '#28a745' : '#dc3545'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: transaction.type === 'income' ? '#28a745' : '#dc3545' }}>
                          {transaction.description}
                        </h4>
                        <span style={{ 
                          fontSize: '0.8em',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: transaction.type === 'income' ? '#d4edda' : '#f8d7da',
                          color: transaction.type === 'income' ? '#155724' : '#721c24'
                        }}>
                          {transaction.type}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1.1em' }}>${transaction.amount.toFixed(2)}</strong>
                        {transaction.category && ` • ${transaction.category}`}
                        {` • ${formatFrequency(transaction.frequency)}`}
                      </div>
                      
                      <div style={{ fontSize: '0.85em', color: '#dc3545', fontWeight: 'bold' }}>
                        {formatDueDate(transaction.nextDueDate)}
                        {missedCount > 1 && ` (${missedCount} occurrences behind)`}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        onClick={() => handleGenerateTransaction(transaction)}
                        disabled={isProcessing}
                        style={{ 
                          backgroundColor: '#28a745',
                          fontSize: '0.8em',
                          padding: '8px 16px'
                        }}
                      >
                        {isProcessing ? 'Adding...' : 'Add Transaction'}
                      </Button>
                      
                      <Button
                        onClick={() => handleSkipTransaction(transaction)}
                        disabled={isProcessing}
                        style={{ 
                          backgroundColor: '#6c757d',
                          fontSize: '0.8em',
                          padding: '8px 16px'
                        }}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                  
                  {missedCount > 1 && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '4px',
                      fontSize: '0.8em',
                      color: '#856404'
                    }}>
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
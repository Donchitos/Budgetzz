// src/features/recurring/RecurringTransactionManager.tsx
import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { calculateNextDueDate } from '../../types/recurringUtils';
import type { RecurringTransaction } from '../../types';

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const expenseCategories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Other"];

function RecurringTransactionManager() {
  const { snapshot: recurringSnapshot, loading, error } = useFirestoreCollection('recurring-transactions');
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Housing');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');

  const recurringTransactions = recurringSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringTransaction)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      alert("Please enter a valid start date.");
      return;
    }

    const endDateObj = hasEndDate && endDate ? new Date(endDate) : null;
    
    if (endDateObj && isNaN(endDateObj.getTime())) {
      alert("Please enter a valid end date.");
      return;
    }
    
    if (endDateObj && endDateObj <= startDateObj) {
      alert("End date must be after start date.");
      return;
    }

    try {
      // Validate frequency type
      const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'yearly'];
      if (!validFrequencies.includes(frequency)) {
        throw new Error(`Invalid frequency: ${frequency}`);
      }

      // Calculate next due date with error handling
      let nextDueDate;
      try {
        nextDueDate = calculateNextDueDate(startDateObj, frequency as any);
      } catch (err) {
        console.error("Error calculating next due date:", err);
        alert("Error calculating next due date. Please check your start date and frequency.");
        return;
      }

      const recurringData: any = {
        type,
        description: description.trim(),
        amount: parsedAmount,
        frequency,
        startDate: startDateObj,
        endDate: endDateObj,
        isActive: true,
        nextDueDate,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (type === 'expense') {
        recurringData.category = category;
      }

      console.log("Creating recurring transaction with data:", recurringData);

      await addDoc(collection(db, 'recurring-transactions'), recurringData);
      
      // Reset form
      setDescription('');
      setAmount('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setHasEndDate(false);
      
      alert(`Recurring ${type} created successfully!`);
    } catch (err) {
      console.error("Detailed error creating recurring transaction: ", err);
      alert(`Error creating recurring transaction: ${(err as Error).message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'recurring-transactions', id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating recurring transaction: ", err);
      alert("Error updating recurring transaction. Please try again.");
    }
  };

  const handleDelete = async (id: string, description: string) => {
    if (window.confirm(`Are you sure you want to delete the recurring transaction "${description}"?`)) {
      try {
        await deleteDoc(doc(db, 'recurring-transactions', id));
      } catch (err) {
        console.error("Error deleting recurring transaction: ", err);
        alert("Error deleting recurring transaction. Please try again.");
      }
    }
  };

  const formatNextDue = (nextDueDate: any) => {
    const date = nextDueDate?.toDate ? nextDueDate.toDate() : new Date(nextDueDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div>
      <Card title="Create Recurring Transaction">
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Frequency</label>
              <select 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${type === 'income' ? 'Income' : 'Expense'} description (e.g., "Monthly Rent", "Salary")`}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: type === 'expense' ? '1fr 1fr' : '1fr', gap: '15px', marginBottom: '15px' }}>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
              step="0.01"
              min="0"
            />
            
            {type === 'expense' && (
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: hasEndDate ? '1fr 1fr' : '1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            {hasEndDate && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required={hasEndDate}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
              />
              Set an end date (optional)
            </label>
          </div>

          <Button type="submit">Create Recurring {type === 'income' ? 'Income' : 'Expense'}</Button>
        </form>
      </Card>

      <Card title="Your Recurring Transactions">
        {loading && <p>Loading...</p>}
        {error && <p>Error loading recurring transactions.</p>}
        
        {recurringTransactions.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            No recurring transactions set up yet. Create your first one above!
          </p>
        ) : (
          <div>
            {recurringTransactions
              .sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1)
              .map(transaction => (
                <div 
                  key={transaction.id} 
                  style={{ 
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: transaction.isActive ? '#f8f9fa' : '#f8f8f8',
                    border: `1px solid ${transaction.isActive ? '#e9ecef' : '#dee2e6'}`,
                    borderRadius: '8px',
                    opacity: transaction.isActive ? 1 : 0.7
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
                        {!transaction.isActive && (
                          <span style={{ 
                            fontSize: '0.8em',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white'
                          }}>
                            PAUSED
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                        <strong>${transaction.amount.toFixed(2)}</strong> • {transaction.frequency}
                        {transaction.category && ` • ${transaction.category}`}
                      </div>
                      
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        Next due: <strong>{formatNextDue(transaction.nextDueDate)}</strong>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        onClick={() => handleToggleActive(transaction.id, transaction.isActive)}
                        style={{ 
                          backgroundColor: transaction.isActive ? '#ffc107' : '#28a745',
                          fontSize: '0.8em',
                          padding: '6px 12px'
                        }}
                      >
                        {transaction.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(transaction.id, transaction.description)}
                        style={{ 
                          backgroundColor: '#dc3545',
                          fontSize: '0.8em',
                          padding: '6px 12px'
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default RecurringTransactionManager;
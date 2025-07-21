// src/features/recurring/RecurringTransactionManager.tsx
import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { calculateNextDueDate } from '../../types/recurringUtils';
import type { RecurringTransaction, NewRecurringTransaction, FrequencyType } from '../../types';
import { Timestamp } from 'firebase/firestore';
import Skeleton from '../../components/Skeleton';
import './RecurringTransactionManager.css';

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
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
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
        nextDueDate = calculateNextDueDate(startDateObj, frequency as FrequencyType);
      } catch (err) {
        console.error("Error calculating next due date:", err);
        alert("Error calculating next due date. Please check your start date and frequency.");
        return;
      }

      const recurringData: NewRecurringTransaction = {
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

  const formatNextDue = (nextDueDate: Date | Timestamp) => {
    const date = nextDueDate instanceof Timestamp ? nextDueDate.toDate() : new Date(nextDueDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="recurring-manager-layout">
      <Card title="Create Recurring Transaction" className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as FrequencyType)}
            >
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${type === 'income' ? 'Income' : 'Expense'} description`}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
              step="0.01"
              min="0"
            />
          </div>
            
          {type === 'expense' && (
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
            
          {hasEndDate && (
            <div className="form-group">
              <label>End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required={hasEndDate}
              />
            </div>
          )}

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
              />
              Set an end date
            </label>
          </div>

          <Button type="submit" className="w-full">Create Recurring {type === 'income' ? 'Income' : 'Expense'}</Button>
        </form>
      </Card>

      <Card title="Your Recurring Transactions" className="list-card">
        {loading && (
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {error && <p>Error loading recurring transactions.</p>}
        
        {!loading && recurringTransactions.length === 0 ? (
          <p className="text-gray-500 italic text-center p-5">
            No recurring transactions set up yet.
          </p>
        ) : (
          <div>
            {recurringTransactions
              .sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1)
              .map(transaction => (
                <div key={transaction.id} className={`transaction-item ${!transaction.isActive ? 'opacity-50' : ''}`}>
                  <div className={`transaction-icon ${transaction.type}`}>
                    {transaction.type === 'income' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m0-4h.01M6 12h.01M18 12h.01M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-info">
                      <h4 className="m-0 font-bold text-gray-800">
                        {transaction.description}
                      </h4>
                      <div className="text-sm text-gray-600">
                        <strong className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          ${transaction.amount.toFixed(2)}
                        </strong> • {transaction.frequency}
                        {transaction.category && ` • ${transaction.category}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Next due: <strong>{formatNextDue(transaction.nextDueDate)}</strong>
                      </div>
                    </div>
                    
                    <div className="transaction-actions">
                      <Button
                        onClick={() => handleToggleActive(transaction.id, transaction.isActive)}
                        className={`text-xs px-3 py-1 ${
                          transaction.isActive ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                      >
                        {transaction.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(transaction.id, transaction.description)}
                        className="btn-delete text-xs px-3 py-1"
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
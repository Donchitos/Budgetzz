// 1. Import useEffect and axios
import { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

interface Expense {
  _id?: string; // MongoDB adds an _id field
  description: string;
  amount: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // 2. useEffect to fetch expenses when the app loads
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // Make a GET request to our backend API
        const response = await axios.get('http://localhost:5000/api/expenses');
        // Update the state with the data from the server
        setExpenses(response.data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };

    fetchExpenses();
  }, []); // The empty array means this effect runs only once on load

  // 3. Update the handler to POST data to the server
  const addExpenseHandler = async (expenseData: { description: string; amount: string }) => {
    try {
      // Make a POST request to our backend API
      const response = await axios.post('/api/expenses', expenseData);
      // Add the new expense (returned from the server) to our state
      setExpenses(prevExpenses => [response.data, ...prevExpenses]);
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  return (
    <div className="App">
      <h1>My Budgetzz App</h1>
      <ExpenseForm onAddExpense={addExpenseHandler} />
      <ExpenseList items={expenses} />
    </div>
  );
}

export default App;
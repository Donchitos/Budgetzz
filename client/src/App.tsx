import { useState } from 'react';
import './App.css';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList'; // <-- ADD THIS LINE

interface Expense {
  description: string;
  amount: string;
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const addExpenseHandler = (expense: Expense) => {
    setExpenses(prevExpenses => [expense, ...prevExpenses]);
  };

  return (
    <div className="App">
      <h1>My Budgetzz App</h1>
      <ExpenseForm onAddExpense={addExpenseHandler} />
      {/* ADD THIS LINE and pass the expenses state down */}
      <ExpenseList items={expenses} />
    </div>
  );
}

export default App;
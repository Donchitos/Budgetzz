import { useState } from 'react';

// 1. Define the structure of the props our component will receive
type ExpenseFormProps = {
  onAddExpense: (expense: { description: string; amount: string }) => void;
};

// 2. Use the props type in the function signature
function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // 3. Call the function passed down from the parent instead of console.log
    onAddExpense({ description: description, amount: amount });

    // 4. Clear the input fields after submitting
    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a New Expense</h2>
      <div>
        <label>Description</label>
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </div>
      <div>
        <label>Amount</label>
        <input 
          type="number" 
          min="0.01" 
          step="0.01" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
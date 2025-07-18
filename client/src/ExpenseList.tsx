// 1. Define the structure of a single expense
interface Expense {
  description: string;
  amount: string;
}

// 2. Define the props our component expects: an array of expenses
interface ExpenseListProps {
  items: Expense[];
}

// 3. Receive the 'items' prop
function ExpenseList({ items }: ExpenseListProps) {
  // 4. If there are no expenses, show a message
  if (items.length === 0) {
    return <h2>No expenses found. Start adding some!</h2>;
  }

  return (
    <ul>
      {/* 5. Map over the items array to render a list item for each expense */}
      {items.map((expense, index) => (
        <li key={index}>
          <span>{expense.description}</span>
          <span>${expense.amount}</span>
        </li>
      ))}
    </ul>
  );
}

export default ExpenseList;
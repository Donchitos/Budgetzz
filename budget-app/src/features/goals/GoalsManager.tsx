import React, { useState } from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';
import { addGoal, addFundsToGoal, updateGoal, deleteGoal } from '../../services/api';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import GoalCard from './GoalCard';
import AddFundsForm from './AddFundsForm';
import GoalForm from './GoalForm';
import Modal from '../../components/Modal';
import './GoalCard.css';

const GoalsManager: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [isGoalFormModalOpen, setGoalFormModalOpen] = useState(false);

  const goals: FinancialGoal[] = snapshot ? snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialGoal)) : [];

  const handleCreateOrUpdateGoal = async (goalData: Partial<FinancialGoal>) => {
    try {
      if (selectedGoal) {
        await updateGoal(selectedGoal.id, goalData);
      } else {
        await addGoal(goalData as any);
      }
      closeGoalFormModal();
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };

  const handleAddFunds = async (amount: number) => {
    if (selectedGoal) {
      try {
        await addFundsToGoal(selectedGoal.id, amount);
        closeAddFundsModal();
      } catch (err) {
        console.error('Error adding funds:', err);
      }
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const openAddFundsModal = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setAddFundsModalOpen(true);
  };

  const closeAddFundsModal = () => {
    setAddFundsModalOpen(false);
    setSelectedGoal(null);
  };

  const openGoalFormModal = (goal?: FinancialGoal) => {
    setSelectedGoal(goal || null);
    setGoalFormModalOpen(true);
  };

  const closeGoalFormModal = () => {
    setGoalFormModalOpen(false);
    setSelectedGoal(null);
  };

  if (loading) {
    return (
      <div>
        <h2>Goals Manager</h2>
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-24" />

        <div className="mt-8">
          <h3>Your Goals</h3>
          <Skeleton className="h-24 w-full mt-4" />
          <Skeleton className="h-24 w-full mt-4" />
        </div>
      </div>
    );
  }
  
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Goals Manager</h2>
      <div className="page-header">
        <Button onClick={() => openGoalFormModal()}>Create Goal</Button>
      </div>
      <div>
        <h3>Your Goals</h3>
        {goals.map((goal: FinancialGoal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onAddFunds={() => openAddFundsModal(goal)}
            onEdit={() => openGoalFormModal(goal)}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>
      
      {/* Add Funds Modal */}
      <Modal
        isOpen={isAddFundsModalOpen}
        onClose={closeAddFundsModal}
        title={selectedGoal ? `Add Funds to ${selectedGoal.title}` : 'Add Funds'}
      >
        {selectedGoal && (
          <AddFundsForm
            onSubmit={handleAddFunds}
            onCancel={closeAddFundsModal}
          />
        )}
      </Modal>
      
      {/* Create/Edit Goal Modal */}
      <Modal
        isOpen={isGoalFormModalOpen}
        onClose={closeGoalFormModal}
        title={selectedGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <GoalForm
          goal={selectedGoal || undefined}
          onSubmit={handleCreateOrUpdateGoal}
          onCancel={closeGoalFormModal}
        />
      </Modal>
    </div>
  );
};

export default GoalsManager;
import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { addBudget } from '../../services/api';
import Button from '../../components/Button';
import Card from '../../components/Card';

interface Recommendation {
  category: string;
  recommendedAmount: number;
}

interface BudgetRecommendationsResponse {
  recommendations: Recommendation[];
}

interface BudgetRecommenderProps {
  onBudgetsApplied: () => void;
}

const BudgetRecommender: React.FC<BudgetRecommenderProps> = ({ onBudgetsApplied }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const generateRecommendations = httpsCallable(functions, 'generateBudgetRecommendations');
        const result = await generateRecommendations({ months: 3 });
        const data = result.data as BudgetRecommendationsResponse;
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Error fetching budget recommendations:", err);
        setError("Could not fetch budget recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleApplyRecommendation = async (category: string, amount: number) => {
    try {
      const now = new Date();
      await addBudget(category, amount, now.getMonth() + 1, now.getFullYear());
      // Remove applied recommendation from the list
      setRecommendations(recommendations.filter(rec => rec.category !== category));
    } catch (err) {
      console.error("Error applying budget:", err);
      alert("Failed to apply budget. Please try again.");
    }
  };

  const handleApplyAll = async () => {
    try {
      const now = new Date();
      for (const rec of recommendations) {
        await addBudget(rec.category, rec.recommendedAmount, now.getMonth() + 1, now.getFullYear());
      }
      setRecommendations([]);
      onBudgetsApplied();
    } catch (err) {
      console.error("Error applying all budgets:", err);
      alert("Failed to apply all budgets. Please try again.");
    }
  };

  if (loading) {
    return <p>Analyzing your spending history...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (recommendations.length === 0) {
    return (
      <Card title="Budget Recommendations">
        <p>We don't have enough data to make recommendations yet. Start by tracking your expenses!</p>
      </Card>
    );
  }

  return (
    <Card title="Smart Budget Suggestions">
      <p>Based on your spending over the last 3 months, we suggest the following monthly budgets:</p>
      <ul>
        {recommendations.map(rec => (
          <li key={rec.category} className="flex justify-between items-center mb-2">
            <span><strong>{rec.category}:</strong> ${rec.recommendedAmount}</span>
            <Button onClick={() => handleApplyRecommendation(rec.category, rec.recommendedAmount)}>
              Apply
            </Button>
          </li>
        ))}
      </ul>
      {recommendations.length > 1 && (
        <Button onClick={handleApplyAll} className="mt-5 bg-green-500 hover:bg-green-600 text-white">
          Apply All Suggestions
        </Button>
      )}
    </Card>
  );
};

export default BudgetRecommender;
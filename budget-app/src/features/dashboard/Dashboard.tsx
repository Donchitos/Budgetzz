import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';

// Import your existing components
// import BalanceOverview from './BalanceOverview';
// import QuickActions from './QuickActions';
// import FinancialInsights from './FinancialInsights';
// import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';

// Temporary placeholder components for demonstration
const BalanceOverview: React.FC = () => (
  <div className="balance-overview">
    <h2>Balance Overview</h2>
    <div className="balance-amount">$10,000</div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="quick-actions">
    <h2>Quick Actions</h2>
    <div className="quick-actions-buttons">
      <button className="quick-action-btn income">ADD INCOME</button>
      <button className="quick-action-btn expense">ADD EXPENSE</button>
      <button className="quick-action-btn transfer">ADD TRANSFER</button>
    </div>
  </div>
);

const FinancialInsights: React.FC = () => (
  <div className="financial-insights">
    <h2>Your Financial Wellness</h2>
    <div className="wellness-message">
      You've spent 5% more this month. Let's see where we can improve!
    </div>
  </div>
);

const GoalsSummaryWidget: React.FC = () => (
  <div className="goals-summary">
    <h2>Goals Summary</h2>
    
    <div className="goal-item">
      <div className="progress-circle" style={{
        background: `conic-gradient(var(--primary-green) 0deg, var(--neutral-gray-light) 0deg)`
      }}>
        0%
      </div>
      <div className="goal-progress">
        <div className="goal-name">Emergency Fund</div>
        <div className="goal-amount">$0 / $6,000</div>
      </div>
    </div>
    
    <div className="goal-item">
      <div className="progress-circle" style={{
        background: `conic-gradient(var(--primary-green) 0deg, var(--neutral-gray-light) 0deg)`
      }}>
        0%
      </div>
      <div className="goal-progress">
        <div className="goal-name">New House</div>
        <div className="goal-amount">$0 / $50,000</div>
      </div>
    </div>
  </div>
);

const DashboardHeader: React.FC<{ userName: string }> = ({ userName }) => (
  <div className="dashboard-header">
    <div>
      <h1>Hello, {userName}!</h1>
      <p>Let's make today a great financial day.</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      <div className="main-content">
        <DashboardHeader userName="User" />
        <div className="dashboard-container">
          <div className="dashboard-columns">
            <div className="dashboard-column-left">
              <BalanceOverview />
              <FinancialInsights />
            </div>
            <div className="dashboard-column-right">
              <QuickActions />
              <GoalsSummaryWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
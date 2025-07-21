import React from 'react';
import Skeleton from '../../components/Skeleton';

const TransactionPageSkeleton: React.FC = () => {
  return (
    <div className="transaction-page">
      <header className="page-header">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40" />
      </header>
      <div className="trackers-container">
        <div className="w-1/2">
          <Skeleton className="h-64" />
        </div>
        <div className="w-1/2">
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
};

export default TransactionPageSkeleton;
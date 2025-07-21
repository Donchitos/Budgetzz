import React from 'react';
import Skeleton from '../../components/Skeleton';

const ReportsPageSkeleton: React.FC = () => {
  return (
    <div>
      <h2>Advanced Reports</h2>
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-12 w-full mb-4" />
      <div className="grid grid-cols-[2fr_1fr] gap-8 mt-8">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
};

export default ReportsPageSkeleton;
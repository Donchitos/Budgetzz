import React from 'react';
import './Reports.css';
import { useReportData } from './useReportData';
import ReportsPageSkeleton from './ReportsPageSkeleton';
import ReportsPageContent from './ReportsPageContent';

const ReportsPage: React.FC = () => {
  const { loading, error } = useReportData();

  if (loading) {
    return <ReportsPageSkeleton />;
  }

  if (error) {
    return <p>Error loading reports: {error.message}</p>;
  }

  return <ReportsPageContent />;
};

export default ReportsPage;
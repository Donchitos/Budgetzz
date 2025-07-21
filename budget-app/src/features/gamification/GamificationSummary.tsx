import React from 'react';
import { useUserProgress } from '../../hooks/useUserProgress';
import BadgeList from './BadgeList';
import Points from './Points';
import ProgressBar from './ProgressBar';
import './Gamification.css';

const GamificationSummary: React.FC = () => {
  const { progress } = useUserProgress();

  if (!progress) {
    return null;
  }

  return (
    <div className="gamification-summary">
      <h2>Trophies</h2>
      <Points points={progress.points} />
      <BadgeList badges={progress.badges} />
      <ProgressBar value={50} max={100} />
    </div>
  );
};

export default GamificationSummary;
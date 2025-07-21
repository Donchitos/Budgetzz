import React from 'react';
import './Gamification.css';

interface PointsProps {
  points: number;
}

const Points: React.FC<PointsProps> = ({ points }) => {
  return (
    <div className="points-container">
      <p>Points: {points}</p>
    </div>
  );
};

export default Points;
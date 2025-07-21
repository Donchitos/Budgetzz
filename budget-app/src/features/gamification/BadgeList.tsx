import React from 'react';
import type { Badge } from '../../types/gamification';
import './Gamification.css';

interface BadgeListProps {
  badges: Badge[];
}

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  return (
    <div className="badge-list">
      {badges.map((badge) => (
        <div key={badge.id} className="badge">
          <img src={badge.icon} alt={badge.name} />
          <p>{badge.name}</p>
        </div>
      ))}
    </div>
  );
};

export default BadgeList;
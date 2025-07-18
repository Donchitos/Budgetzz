import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
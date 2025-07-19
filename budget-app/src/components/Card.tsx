import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className }) => {
  return (
    <section className={`card ${className || ''}`} aria-labelledby={title ? `card-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}>
      {title && <h2 id={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h2>}
      {children}
    </section>
  );
};

export default Card;
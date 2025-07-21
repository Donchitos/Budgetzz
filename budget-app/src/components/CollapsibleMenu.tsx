import React, { useState, type ReactNode } from 'react';
import './CollapsibleMenu.css';

interface CollapsibleMenuProps {
  title: string;
  children: ReactNode;
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible-menu">
      <div className="menu-header" onClick={toggleOpen}>
        {title}
        <span className={`arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
      </div>
      <div className={`menu-content ${isOpen ? 'open' : ''}`}>{children}</div>
    </div>
  );
};

export default CollapsibleMenu;
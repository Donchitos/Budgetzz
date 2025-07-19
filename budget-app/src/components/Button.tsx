import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'destructive';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant, ...props }) => {
  const buttonClass = `button ${variant ? `button-${variant}` : ''} ${className || ''}`;
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
import React from 'react';
import styles from './SmallButton.module.scss';

export interface SmallButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const SmallButton: React.FC<SmallButtonProps> = ({
  children = 'Выйти',
  onClick,
  type = 'button',
  disabled = false,
}) => {
  return (
    <button
      className={styles.smallButton}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default SmallButton;
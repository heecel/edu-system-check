import React from 'react';
import styles from './input.module.scss';

export const Input = ({ label, ...props }) => {
  return (
    <div className={styles.inputBlock}>
      <label className={styles.label}>{label}</label>
      <input className={styles.inputField} {...props} />
    </div>
  );
};

export default Input;
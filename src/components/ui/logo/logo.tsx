import React from 'react';
import styles from './Logo.module.scss';

export const Logo: React.FC = () => {
  return (
    <svg
      className={styles.logo}
      width="39"
      height="39"
      viewBox="0 0 39 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="19.5,0 39,39 0,39"
        fill="#515968"          /* dark blue */
        stroke="#FFFFFF"        /* white */
        strokeWidth="2"
      />
    </svg>
  );
};

export default Logo;
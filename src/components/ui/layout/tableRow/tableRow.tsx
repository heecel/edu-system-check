import React from 'react';
import styles from './TableRow.module.scss';

export interface TableRowProps {
  date: string;
  status: string; // 'П', 'Н', 'У'
  reason: string;
}

export const TableRow: React.FC<TableRowProps> = ({ date, status, reason }) => {
  return (
    <div className={styles.tableRow}>
      <span className={styles.rowCell}>{date}</span>
      <span className={styles.rowCell}>{status}</span>
      <span className={styles.rowCell}>{reason}</span>
    </div>
  );
};

export default TableRow;
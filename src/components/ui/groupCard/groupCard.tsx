import React from 'react';
import styles from './GroupCard.module.scss';

export interface GroupCardProps {
  groupName: string; // например, "ИС-21"
  disciplinesCount: number; // количество дисциплин
  studentsCount: number; // количество студентов
  onOpenTable?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  groupName,
  disciplinesCount,
  studentsCount,
  onOpenTable,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.groupName}>{groupName}</div>

      <div className={styles.infoBlock}>
        <span className={styles.infoText}>Дисциплин: {disciplinesCount}</span>
        <span className={styles.infoText}>Студентов: {studentsCount}</span>
      </div>

      <button className={styles.openButton} onClick={onOpenTable}>
        Открыть табель
      </button>
    </div>
  );
};

export default GroupCard;
import React from 'react';
import styles from './disciplineCard.module.scss';

export interface DisciplineCardProps {
  disciplineName?: string;
  absencesCount?: number;
  onViewAttendance?: () => void;
}

// Функция для правильного склонения слова "пропуск"
const getAbsencesText = (count: number): string => {
  if (count === 0) {
    return '0 пропусков';
  } else if (count === 1) {
    return '1 пропуск';
  } else if (count >= 2 && count <= 4) {
    return `${count} пропуска`;
  } else {
    return `${count} пропусков`;
  }
};

export const DisciplineCard: React.FC<DisciplineCardProps> = ({
  disciplineName = 'Информатика',
  absencesCount = 3,
  onViewAttendance,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.infoBlock}>
        <h3 className={styles.disciplineName}>{disciplineName}</h3>
        <p className={styles.absencesCount}>
          {getAbsencesText(absencesCount)}
        </p>
      </div>

      <button className={styles.attendanceButton} onClick={onViewAttendance}>
        Посмотреть посещаемость
      </button>
    </div>
  );
};

export default DisciplineCard;
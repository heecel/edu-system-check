import React, { useState } from 'react';
import { Logo } from '../logo/logo';
import styles from './PollModal.module.scss';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  disciplineName: string;
  disciplineId: number;
  date: string;
  onSubmit: (data: { disciplineId: number; date: string }) => void;
}

export const PollModal: React.FC<PollModalProps> = ({
  isOpen,
  onClose,
  userName,
  disciplineName,
  disciplineId,
  date,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ disciplineId, date });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <h2 className={styles.title}>Подтверждение присутствия на занятии</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>ФИО</label>
          <input
            className={styles.fieldInput}
            value={userName}
            readOnly
            disabled
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Дисциплина</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.fieldSelect}
              value={disciplineId}
              disabled
            >
              <option value={disciplineId}>{disciplineName}</option>
            </select>
            <button className={styles.selectArrow} type="button" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8690A2" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.rowFields}>
          <div className={styles.fieldGroupHalf}>
            <label className={styles.fieldLabel}>Дата</label>
            <div className={styles.dateWrapper}>
              <input
                className={styles.fieldInput}
                type="date"
                value={date}
                disabled
              />
              <button className={styles.dateIcon} type="button" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8690A2" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>
          </div>
          <button
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Подтверждение...' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollModal;
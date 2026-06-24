import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../ui/layout/header/header';
import { getUser, logout } from '../../../utils/auth';
import styles from './teacherGroups.module.scss';

export const TeacherGroups = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const user = getUser();
  const [groupName, setGroupName] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/teacher');
  };

  const handleSave = () => {
    console.log('Сохранить изменения');
  };

  const handleStartPoll = () => {
    console.log('Провести опрос присутствия');
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    console.log(`Выбран период: ${period}`);
  };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (response.ok) {
          const data = await response.json();
          setGroupName(data.name);
        } else {
          setGroupName('Группа не найдена');
        }
      } catch {
        setGroupName('Ошибка загрузки');
      }
    };

    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  return (
    <div className={styles.page}>
      {/* Шапка зафиксирована сверху */}
      <div className={styles.headerWrapper}>
        <Header userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />
      </div>

      {/* Контент с прокруткой */}
      <div className={styles.pageContent}>
        <div className={styles.content}>
          <div className={styles.backBlock}>
            <button className={styles.backButton} onClick={handleBack}>
              <span className={styles.backArrow}>←</span>
              Назад к группам
            </button>
          </div>

          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              Ведомость по группе: {groupName || 'Загрузка...'}
            </h2>
            
            <div className={styles.buttonsWrapper}>
              <button className={styles.saveButton} onClick={handleSave}>
                Сохранить
              </button>
              <button className={styles.pollButton} onClick={handleStartPoll}>
                Провести опрос присутствия
              </button>
            </div>
          </div>

          {/* Блок с тремя кнопками выбора периода */}
          <div className={styles.periodSelector}>
            <button
              className={`${styles.periodButton} ${selectedPeriod === 'daily' ? styles.active : ''}`}
              onClick={() => handlePeriodChange('daily')}
            >
              Ежедневная
            </button>
            <button
              className={`${styles.periodButton} ${selectedPeriod === 'weekly' ? styles.active : ''}`}
              onClick={() => handlePeriodChange('weekly')}
            >
              Еженедельная
            </button>
            <button
              className={`${styles.periodButton} ${selectedPeriod === 'monthly' ? styles.active : ''}`}
              onClick={() => handlePeriodChange('monthly')}
            >
              Ежемесячная
            </button>
          </div>
        </div>

        <div className={styles.tablePlaceholder}>
          <p>Таблица посещаемости появится позже</p>
          <p style={{ fontSize: '14px', color: '#8690A2', marginTop: '8px' }}>
            Текущий период: {selectedPeriod === 'daily' ? 'Ежедневная' : selectedPeriod === 'weekly' ? 'Еженедельная' : 'Ежемесячная'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherGroups;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../ui/layout/header/header';
import { DisciplineCard } from '../../ui/disciplineCard/disciplineCard';
import { getUser, logout } from '../../../utils/auth';
import { getDisciplinesForStudent, type Discipline } from '../../../services/disciplinesService';
import styles from './mainStudent.module.scss';

// Объект с фиксированными пропусками для каждой дисциплины (по id)
const absencesMap: Record<number, number> = {
  1: 2,  // Программирование на Python - 2 пропуска
  2: 1,  // Информатика - 1 пропуск
  3: 3,  // Базы данных - 3 пропуска
  4: 0,  // Веб-разработка - 0 пропусков
  5: 4,  // Алгоритмы и структуры данных - 4 пропуска
  6: 1,  // Операционные системы - 1 пропуск
  7: 5,  // Компьютерные сети - 5 пропусков
  8: 2,  // Тестирование ПО - 2 пропуска
  9: 3,  // Математический анализ - 3 пропуска
  10: 0, // Линейная алгебра - 0 пропусков
  11: 1, // Дискретная математика - 1 пропуск
  12: 4  // Теория вероятностей - 4 пропуска
};

export const MainStudent = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchDisciplines = async () => {
      if (!user || !user.groupId) {
        setError('Ошибка: группа студента не найдена');
        setLoading(false);
        return;
      }

      try {
        const data = await getDisciplinesForStudent(user.groupId);
        setDisciplines(data);
      } catch {
        setError('Не удалось загрузить дисциплины');
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
        <div className={styles.content}>
          <p className={styles.loading}>Загрузка дисциплин...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Header userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
        <div className={styles.content}>
          <p className={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header userName={user?.fullName || 'Студент'} onLogout={handleLogout} />
      
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Мои дисциплины</h2>
        </div>

        {disciplines.length === 0 ? (
          <p className={styles.noData}>У вас пока нет дисциплин</p>
        ) : (
          <div className={styles.disciplinesGrid}>
            {disciplines.map((discipline) => (
              <DisciplineCard
                key={discipline.id}
                disciplineName={discipline.name}
                absencesCount={absencesMap[discipline.id] || 0}
                onViewAttendance={() => {
                  navigate(`/student/discipline/${discipline.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainStudent;
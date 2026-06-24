import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../ui/layout/header/header';
import { DisciplineCard } from '../../ui/disciplineCard/disciplineCard';
import PollModal from '../../ui/pollModal/pollModal';
import { getUser, logout } from '../../../utils/auth';
import { getDisciplinesForStudent, type Discipline } from '../../../services/disciplinesService';
import styles from './mainStudent.module.scss';

export const MainStudent = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [absencesMap, setAbsencesMap] = useState<Record<number, number>>({});
  
  // Флаг для предотвращения двойных запросов в StrictMode
  const isFetchingRef = useRef<boolean>(false);

  // ===== СОСТОЯНИЯ ДЛЯ ОПРОСА =====
  const [isPollOpen, setIsPollOpen] = useState<boolean>(false);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const pollShownRef = useRef<boolean>(false);
  const lastPollIdRef = useRef<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ===== ЗАГРУЗКА ДИСЦИПЛИН И ПРОПУСКОВ =====
  useEffect(() => {
    const fetchData = async () => {
      // Предотвращаем двойные запросы
      if (isFetchingRef.current) return;
      if (!user || !user.groupId) {
        setError('Ошибка: группа студента не найдена');
        setLoading(false);
        return;
      }

      isFetchingRef.current = true;
      setError(''); // Очищаем ошибку перед загрузкой

      try {
        console.log('👤 Текущий пользователь:', user);
        console.log('📚 Загружаем дисциплины для группы:', user.groupId);

        // 1. Загружаем дисциплины студента
        const disciplinesData = await getDisciplinesForStudent(user.groupId);
        setDisciplines(disciplinesData);
        console.log('📚 Дисциплины:', disciplinesData);

        // 2. Загружаем ВСЮ посещаемость
        console.log('🔄 Загружаем все записи посещаемости...');
        const attendanceRes = await fetch('/api/attendance');
        
        if (!attendanceRes.ok) {
          console.error('❌ Ошибка загрузки attendance:', attendanceRes.status);
          setError('Не удалось загрузить данные посещаемости');
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }

        const allAttendance = await attendanceRes.json();
        console.log('📋 Все записи посещаемости (всего):', allAttendance.length);
        console.log('📋 Пример записи:', allAttendance[0]);

        // 3. Фильтруем записи ТОЛЬКО для этого студента
        const studentAttendance = allAttendance.filter((record: any) => {
          return String(record.studentId) === String(user.id);
        });

        console.log(`📋 Записей для студента ${user.id}:`, studentAttendance.length);

        // 4. Считаем пропуски для каждой дисциплины
        const absences: Record<number, number> = {};
        
        disciplinesData.forEach(discipline => {
          const absencesCount = studentAttendance.filter((record: any) => {
            return String(record.disciplineId) === String(discipline.id) && 
                   (record.status === 'Н' || record.status === 'У');
          }).length;
          
          console.log(`📊 Дисциплина ${discipline.id} (${discipline.name}): ${absencesCount} пропусков`);
          absences[discipline.id] = absencesCount;
        });
        
        setAbsencesMap(absences);
        setError('');

      } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [user]); // Убираем лишние зависимости, оставляем только user

  // ===== ПРОВЕРКА АКТИВНОГО ОПРОСА =====
  useEffect(() => {
    const checkPoll = async () => {
      if (!user || !user.groupId) return;
      if (hasConfirmed) return;

      try {
        const response = await fetch(`/api/polls?groupId=${user.groupId}&active=true`);
        if (!response.ok) return;
        
        const polls = await response.json();
        
        if (polls.length > 0) {
          const poll = polls[0];
          const now = new Date();
          const expires = new Date(poll.expiresAt);
          
          if (now < expires) {
            if (lastPollIdRef.current !== poll.id && !pollShownRef.current) {
              lastPollIdRef.current = poll.id;
              pollShownRef.current = true;
              setActivePoll(poll);
              setIsPollOpen(true);
            }
          } else {
            await fetch(`/api/polls/${poll.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ active: false }),
            });
            if (lastPollIdRef.current === poll.id) {
              setIsPollOpen(false);
              setActivePoll(null);
              pollShownRef.current = false;
              lastPollIdRef.current = null;
            }
          }
        } else {
          setIsPollOpen(false);
          setActivePoll(null);
          pollShownRef.current = false;
          lastPollIdRef.current = null;
        }
      } catch (error) {
        console.error('Ошибка проверки опроса:', error);
      }
    };

    const interval = setInterval(checkPoll, 5000);
    checkPoll();

    return () => clearInterval(interval);
  }, [user, hasConfirmed]);

  // ===== ПОДТВЕРЖДЕНИЕ ОПРОСА =====
  const handlePollSubmit = async (data: { disciplineId: number; date: string }) => {
    console.log('✅ Подтверждение опроса:', data);
    
    try {
      if (!user) return;

      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(user.id),
          disciplineId: data.disciplineId,
          date: data.date,
          status: 'П',
          reason: '',
        }),
      });
      console.log('✅ Отметка о присутствии сохранена!');

      setHasConfirmed(true);

    } catch (error) {
      console.error('Ошибка подтверждения опроса:', error);
    }

    setIsPollOpen(false);
    setActivePoll(null);
    pollShownRef.current = false;
    lastPollIdRef.current = null;
  };

  // ===== ЗАКРЫТИЕ МОДАЛКИ =====
  const handlePollClose = () => {
    setIsPollOpen(false);
    setActivePoll(null);
    pollShownRef.current = false;
    lastPollIdRef.current = null;
  };

  // ===== ЗАГРУЗКА =====
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

  // Показываем ошибку только если она есть и не в процессе загрузки
  if (error && !loading) {
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

      {/* ===== МОДАЛЬНОЕ ОКНО ОПРОСА ===== */}
      <PollModal
        isOpen={isPollOpen}
        onClose={handlePollClose}
        userName={user?.fullName || 'Студент'}
        disciplineName={activePoll?.disciplineName || ''}
        disciplineId={activePoll?.disciplineId || 0}
        date={activePoll?.date || ''}
        onSubmit={handlePollSubmit}
      />
    </div>
  );
};

export default MainStudent;
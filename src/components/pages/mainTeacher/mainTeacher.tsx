import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../ui/layout/header/header';
import { GroupCard } from '../../ui/groupCard/groupCard';
import { getUser, logout } from '../../../utils/auth';
import { getFullGroupsInfo } from '../../../services/groupsService';
import styles from './mainTeacher.module.scss';

export const MainTeacher = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [groups, setGroups] = useState<{
    id: number;
    name: string;
    disciplinesCount: number;
    studentsCount: number;
  }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenTable = (groupId: number, groupName: string) => {
    navigate(`/teacher/group/${groupId}`);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user || !user.id) {
        setError('Ошибка: преподаватель не найден');
        setLoading(false);
        return;
      }

      try {
        const data = await getFullGroupsInfo(user.id);
        setGroups(data);
      } catch {
        setError('Не удалось загрузить группы');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />
        <div className={styles.content}>
          <p className={styles.loading}>Загрузка групп...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Header userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />
        <div className={styles.content}>
          <p className={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />

      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Мои группы</h2>
        </div>

        {groups.length === 0 ? (
          <p className={styles.noData}>У вас пока нет групп</p>
        ) : (
          <div className={styles.groupsGrid}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                groupName={group.name}
                disciplinesCount={group.disciplinesCount}
                studentsCount={group.studentsCount}
                onOpenTable={() => handleOpenTable(group.id, group.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainTeacher;
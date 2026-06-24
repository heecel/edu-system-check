import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../ui/layout/header/header';
import { getUser, logout } from '../../../utils/auth';
import styles from './teacherGroups.module.scss';

// ===== ИНТЕРФЕЙСЫ =====
interface Student {
  id: string;
  fullName: string;
  groupId: number;
}

interface AttendanceRow {
  studentId: string;
  fullName: string;
  mark: string;
  reason: string;
}

interface Discipline {
  id: string;
  name: string;
}

// ===== КОМПОНЕНТ ВЫБОРА ДИСЦИПЛИНЫ =====
interface DisciplineSelectProps {
  value: string;
  groupId: string | undefined;
  onChange: (name: string, id: string) => void;
}

const DisciplineSelect = ({ value, groupId, onChange }: DisciplineSelectProps) => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchDisciplines = async () => {
      try {
        const response = await fetch(`/api/disciplines?groupId=${groupId}`);
        if (response.ok) {
          const data: Discipline[] = await response.json();
          setDisciplines(data);
          if (data.length > 0 && !value) {
            onChange(data[0].name, data[0].id);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
      }
    };

    fetchDisciplines();
  }, [groupId]);

  const handleSelect = (discipline: Discipline) => {
    onChange(discipline.name, discipline.id);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectWrapper}>
      <div className={styles.selectInputWrapper} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.selectValue}>{value || 'Выберите дисциплину'}</span>
        <button className={styles.selectArrowButton} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8690A2" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className={styles.selectDropdown}>
          {disciplines.map((disc) => (
            <div
              key={disc.id}
              className={styles.selectOption}
              onClick={() => handleSelect(disc)}
            >
              {disc.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== КАСТОМНЫЙ ИНПУТ ДЛЯ ДАТАПИКЕРА =====
const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder }, ref) => (
    <div className={styles.dateInputWrapper}>
      <input
        ref={ref}
        className={styles.dateInput}
        value={value}
        placeholder={placeholder || 'дд.мм.гггг'}
        readOnly
        onClick={onClick}
      />
      <button className={styles.calendarButton} onClick={onClick} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8690A2" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
    </div>
  )
);

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
export const TeacherGroups = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const user = getUser();

  const [groupName, setGroupName] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('');
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Дни недели для шапки
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // ===== НАВИГАЦИЯ =====
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/teacher');
  };

  const handleDownloadReport = () => {
    console.log('Скачать отчет Word');
  };

  // ===== ЗАПУСК ОПРОСА ПРИСУТСТВИЯ =====
  const handleStartPoll = async () => {
    if (!selectedDisciplineId) {
      setSaveMessage('⚠️ Выберите дисциплину');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!groupId) {
      setSaveMessage('⚠️ Группа не выбрана');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!startDate) {
      setSaveMessage('⚠️ Выберите дату');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setLoading(true);
    setSaveMessage('⏳ Запуск опроса...');

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const pollData = {
      disciplineId: parseInt(selectedDisciplineId),
      disciplineName: selectedDiscipline,
      teacherId: parseInt(user?.id || '1'),
      groupId: parseInt(groupId),
      date: dateStr,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      active: true,
    };

    try {
      const existingPollsRes = await fetch(`/api/polls?groupId=${groupId}&active=true`);
      const existingPolls = await existingPollsRes.json();
      
      for (const poll of existingPolls) {
        const pollExpires = new Date(poll.expiresAt);
        if (new Date() > pollExpires) {
          await fetch(`/api/polls/${poll.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false }),
          });
        }
      }

      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData),
      });

      if (response.ok) {
        setSaveMessage('✅ Опрос присутствия запущен на 10 минут!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ Ошибка запуска опроса');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Ошибка запуска опроса:', error);
      setSaveMessage('❌ Ошибка соединения с сервером');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ===== ИЗМЕНЕНИЕ ОТМЕТКИ =====
  const handleMarkChange = (studentId: string, value: string) => {
    setAttendanceRows(prev =>
      prev.map(row =>
        row.studentId === studentId
          ? { ...row, mark: value, reason: (value === 'Н' || value === 'У') ? row.reason : '-' }
          : row
      )
    );
  };

  // ===== ИЗМЕНЕНИЕ ПРИЧИНЫ =====
  const handleReasonChange = (studentId: string, value: string) => {
    setAttendanceRows(prev =>
      prev.map(row =>
        row.studentId === studentId ? { ...row, reason: value } : row
      )
    );
  };

  // ===== ВЫБОР ДИСЦИПЛИНЫ =====
  const handleDisciplineChange = (name: string, id: string) => {
    setSelectedDiscipline(name);
    setSelectedDisciplineId(id);
  };

  // ===== ЗАГРУЗКА ДАННЫХ =====
  const loadData = useCallback(async () => {
    if (!groupId || !selectedDisciplineId || !startDate) return;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    console.log(`🔄 Загрузка: группа=${groupId}, дисциплина=${selectedDisciplineId}, дата=${dateStr}`);

    try {
      const studentsRes = await fetch(`/api/students?groupId=${groupId}`);
      const studentsData: Student[] = await studentsRes.json();

      const attendanceRes = await fetch(`/api/attendance`);
      const allAttendance = await attendanceRes.json();

      const filteredAttendance = allAttendance.filter((item: any) =>
        String(item.disciplineId) === String(selectedDisciplineId) &&
        String(item.date) === dateStr
      );

      const rows: AttendanceRow[] = studentsData.map(student => {
        const found = filteredAttendance.find(
          (item: any) => String(item.studentId) === String(student.id)
        );
        return {
          studentId: student.id,
          fullName: student.fullName,
          mark: found ? found.status : '-',
          reason: found && found.reason ? found.reason : '-',
        };
      });

      setAttendanceRows(rows);
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
    }
  }, [groupId, selectedDisciplineId, startDate]);

  // ===== СОХРАНЕНИЕ =====
  const handleSave = async () => {
    if (!selectedDisciplineId) {
      setSaveMessage('⚠️ Выберите дисциплину');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (!startDate) {
      setSaveMessage('⚠️ Выберите дату');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setLoading(true);
    setSaveMessage('⏳ Сохранение...');

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    try {
      const existingRes = await fetch(`/api/attendance`);
      const allRecords = await existingRes.json();
      const existingRecords = allRecords.filter((item: any) =>
        String(item.disciplineId) === String(selectedDisciplineId) &&
        String(item.date) === dateStr
      );

      if (existingRecords.length > 0) {
        await Promise.all(
          existingRecords.map((record: any) =>
            fetch(`/api/attendance/${record.id}`, { method: 'DELETE' })
          )
        );
      }

      const rowsToSave = attendanceRows.filter(row => row.mark !== '-');

      for (const row of rowsToSave) {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: row.studentId,
            disciplineId: selectedDisciplineId,
            date: dateStr,
            status: row.mark,
            reason: (row.mark === 'Н' || row.mark === 'У') ? (row.reason === '-' ? '' : row.reason) : '',
          }),
        });
      }

      setSaveMessage(`✅ Сохранено ${rowsToSave.length} записей!`);
      setTimeout(() => setSaveMessage(''), 3000);

      await loadData();

    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      setSaveMessage('❌ Ошибка сохранения');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ===== ЗАГРУЗКА НАЗВАНИЯ ГРУППЫ =====
  useEffect(() => {
    if (!groupId) return;
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (response.ok) {
          const data = await response.json();
          setGroupName(data.name);
        }
      } catch (error) {
        console.error('Ошибка загрузки группы:', error);
      }
    };
    fetchGroup();
  }, [groupId]);

  // ===== ПЕРЕЗАГРУЗКА ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== РЕНДЕР =====
  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <Header userName={user?.fullName || 'Преподаватель'} onLogout={handleLogout} />
      </div>

      <div className={styles.pageContent}>
        <div className={styles.leftContent}>
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
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button 
                className={styles.pollButton} 
                onClick={handleStartPoll}
                disabled={loading}
              >
                {loading ? 'Запуск...' : 'Провести опрос присутствия'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.centerContent}>
          <div className={styles.periodSelector}>
            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'daily' ? 'Ежедневная' : period === 'weekly' ? 'Еженедельная' : 'Ежемесячная'}
              </button>
            ))}
          </div>

          <div className={styles.dateBlock}>
            <div className={styles.dateItem}>
              <label className={styles.dateLabel}>Дата начала</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                customInput={<CustomDateInput />}
                dateFormat="dd.MM.yyyy"
                popperPlacement="bottom-start"
              />
            </div>

            <div className={styles.dateItem}>
              <label className={styles.dateLabel}>Дисциплина</label>
              <DisciplineSelect
                value={selectedDiscipline}
                groupId={groupId}
                onChange={handleDisciplineChange}
              />
            </div>

            <div className={styles.downloadItem}>
              <button className={styles.downloadButton} onClick={handleDownloadReport}>
                Скачать отчет Word
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={styles.saveMessage}>{saveMessage}</div>
          )}
        </div>

        {/* ===== ТАБЛИЦА ===== */}
        <div className={styles.tableContainer}>
          {/* Шапка таблицы — меняется в зависимости от выбранного периода */}
          {selectedPeriod === 'daily' && (
            <div className={styles.tableHeader}>
              <span className={styles.headerCell}>п/п</span>
              <span className={styles.headerCell}>ФИО</span>
              <span className={styles.headerCell}>Отметка</span>
              <span className={styles.headerCell}>Причина отсутствия</span>
            </div>
          )}

          {selectedPeriod === 'weekly' && (
            <div className={styles.tableHeaderWeekly}>
              <span className={styles.headerCell}>п/п</span>
              <span className={styles.headerCell}>ФИО</span>
              <div className={styles.weekDaysBlock}>
                {weekDays.map((day) => (
                  <span key={day} className={styles.weekDayCell}>
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedPeriod === 'monthly' && (
            <div className={styles.tableHeader}>
              <span className={styles.headerCell}>п/п</span>
              <span className={styles.headerCell}>ФИО</span>
              <span className={styles.headerCell}>Отметка</span>
              <span className={styles.headerCell}>Причина отсутствия</span>
            </div>
          )}

          {/* ===== ТЕЛО ТАБЛИЦЫ (для ежедневной) ===== */}
          {selectedPeriod === 'daily' && (
            <div className={styles.tableBody}>
              {attendanceRows.length === 0 ? (
                <p className={styles.noData}>Нет данных о студентах</p>
              ) : (
                attendanceRows.map((row, index) => {
                  const isReasonDisabled = row.mark === '-' || row.mark === 'П';
                  return (
                    <div key={row.studentId} className={styles.tableRow}>
                      <span className={styles.rowCell}>{index + 1}</span>
                      <span className={styles.rowCell}>{row.fullName}</span>
                      <div className={styles.rowCell}>
                        <select
                          className={styles.markSelect}
                          value={row.mark}
                          onChange={(e) => handleMarkChange(row.studentId, e.target.value)}
                        >
                          <option value="-">-</option>
                          <option value="П">П</option>
                          <option value="У">У</option>
                          <option value="Н">Н</option>
                        </select>
                      </div>
                      <div className={styles.rowCell}>
                        <input
                          type="text"
                          className={`${styles.reasonInput} ${isReasonDisabled ? styles.reasonDisabled : ''}`}
                          value={row.reason === '-' ? '' : row.reason}
                          onChange={(e) => handleReasonChange(row.studentId, e.target.value)}
                          placeholder={isReasonDisabled ? 'Отметка не выбрана' : 'Введите причину'}
                          disabled={isReasonDisabled}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ===== ТЕЛО ТАБЛИЦЫ (для еженедельной) ===== */}
          {selectedPeriod === 'weekly' && (
            <div className={styles.tableBody}>
              <p className={styles.noData}>Еженедельная таблица в разработке...</p>
            </div>
          )}

          {/* ===== ТЕЛО ТАБЛИЦЫ (для ежемесячной) ===== */}
          {selectedPeriod === 'monthly' && (
            <div className={styles.tableBody}>
              <p className={styles.noData}>Ежемесячная таблица в разработке...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGroups;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button/button';
import { Logo } from '../../ui/logo/logo';
import { authenticateUser, generateToken } from '../../../services/authService';
import { setAuth } from '../../../utils/auth';
import styles from './login.module.scss';

export const Login = () => {
  const navigate = useNavigate();
  
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      const user = await authenticateUser(login, password);

      if (!user) {
        setError('Неверный логин или пароль');
        setLoading(false);
        return;
      }

      setAuth(user, generateToken());
      
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/teacher');
      }
    } catch {
      setError('Не удалось подключиться к серверу. Запустите npm run dev');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.headerBlock}>
          <Logo />
          <h1 className={styles.title}>Контроль посещаемости</h1>
          <h2 className={styles.subtitle}>Вход в систему</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.fieldsBlock}>
          {/* Логин */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Логин</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="student1"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          {/* Пароль с глазом */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Пароль</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.inputField}
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  // Глаз открытый
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Глаз закрытый
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
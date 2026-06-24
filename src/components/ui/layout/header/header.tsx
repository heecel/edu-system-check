import React from 'react';
import { Logo } from '../../logo/logo';
import { SmallButton } from '../../smallButton/smallButton';
import styles from './header.module.scss';

export interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Иванов Иван Иванович',
  onLogout,
}) => {
  return (
    <header className={`${styles.header} header`}> {/* добавляем класс "header" */}
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <h1 className={styles.title}>Ведомость посещаемости</h1>

      <div className={styles.userBlock}>
        <span className={styles.userName}>{userName}</span>
        <SmallButton onClick={onLogout}>Выйти</SmallButton>
      </div>
    </header>
  );
};

export default Header;
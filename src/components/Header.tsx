import { useState, useEffect } from 'react';
import '@styles/Header.scss';
import Searchbar from '../components/Searchbar';
import { TimezoneInfo } from './Timezone';

interface HeaderProps {
  addTimezone: (timezone: TimezoneInfo) => void;
}

const Header: React.FC<HeaderProps> = ({ addTimezone }) => {
  // Search functionality ==============================
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Theme functionality ==============================
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const systemPreferce = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    return systemPreferce;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const systemThemeChangeListener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', systemThemeChangeListener);
    return () =>
      mediaQuery.removeEventListener('change', systemThemeChangeListener);
  }, []);

  // save theme to local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo"></div>
        <div className="header-btns">
          <button
            className="header-btn header-btn__plus"
            onClick={toggleSearch}></button>
          <button
            className="header-btn header-btn__theme"
            onClick={toggleTheme}></button>
        </div>
      </div>
      {showSearch && <Searchbar addTimezone={addTimezone} />}
    </header>
  );
};

export default Header;

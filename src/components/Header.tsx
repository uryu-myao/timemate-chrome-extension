import { useState, useEffect, useRef } from 'react';
import '@styles/Header.scss';
import Searchbar from '../components/Searchbar';
import { TimezoneInfo } from './Timezone';
import type { SortMode } from '../App';

interface HeaderProps {
  addTimezone: (timezone: TimezoneInfo) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  addTimezone,
  sortMode,
  onSortChange,
}) => {
  // Search functionality ==============================
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => {
    setShowSortMenu(false);
    setShowSearch((prev) => !prev);
  };
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const toggleSortMenu = () => {
    setShowSearch(false);
    setShowSortMenu((prev) => !prev);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo"></div>
        <div className="header-btns">
          <button
            className="header-btn header-btn__plus"
            aria-label="Toggle search"
            onClick={toggleSearch}></button>
          <div className="header-sort" ref={sortRef}>
            <button
              className="header-btn header-btn__sort"
              aria-label="Sort options"
              onClick={toggleSortMenu}></button>
            {showSortMenu && (
              <div className="header-sort__menu">
                <button
                  className={`header-sort__item ${
                    sortMode === 'newest' ? 'active' : ''
                  }`}
                  onClick={() => {
                    onSortChange('newest');
                    setShowSortMenu(false);
                  }}>
                  Sort by newest (default)
                </button>
                <button
                  className={`header-sort__item ${
                    sortMode === 'time' ? 'active' : ''
                  }`}
                  onClick={() => {
                    onSortChange('time');
                    setShowSortMenu(false);
                  }}>
                  Sort by time
                </button>
                <button
                  className={`header-sort__item ${
                    sortMode === 'alphabet' ? 'active' : ''
                  }`}
                  onClick={() => {
                    onSortChange('alphabet');
                    setShowSortMenu(false);
                  }}>
                  Sort by alphabet
                </button>
              </div>
            )}
          </div>
          <button
            className="header-btn header-btn__theme"
            aria-label="Toggle theme"
            onClick={toggleTheme}></button>
        </div>
      </div>
      {showSearch && (
        <Searchbar
          addTimezone={addTimezone}
          onSelect={() => setShowSearch(false)}
        />
      )}
    </header>
  );
};

export default Header;

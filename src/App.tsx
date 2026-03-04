import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import TimezoneList from './components/TimezoneList';
import { TimezoneInfo } from './components/Timezone';
import '@styles/_reset.css';
import '@styles/main.scss';

export type SortMode = 'newest' | 'time' | 'alphabet';
export type AddTimezoneResult = 'added' | 'duplicate' | 'limit';
const SORT_MODE_STORAGE_KEY = 'timemate.sort-mode.v1';

function App() {
  const [addTimezoneFn, setAddTimezoneFn] = useState<
    ((timezone: TimezoneInfo) => AddTimezoneResult) | null
  >(null);
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    const stored = localStorage.getItem(SORT_MODE_STORAGE_KEY);
    if (stored === 'newest' || stored === 'time' || stored === 'alphabet') {
      return stored;
    }
    return 'newest';
  });

  const registerAddTimezone = useCallback(
    (fn: (timezone: TimezoneInfo) => AddTimezoneResult) => {
      setAddTimezoneFn(() => fn);
    },
    []
  );

  const handleAddTimezone = (timezone: TimezoneInfo): AddTimezoneResult => {
    if (addTimezoneFn) {
      return addTimezoneFn(timezone);
    }
    return 'duplicate';
  };

  useEffect(() => {
    localStorage.setItem(SORT_MODE_STORAGE_KEY, sortMode);
  }, [sortMode]);

  return (
    <div className="app">
      <Header
        addTimezone={handleAddTimezone}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />
      <div className="app-content">
        <TimezoneList onAddTimezone={registerAddTimezone} sortMode={sortMode} />
      </div>
    </div>
  );
}

export default App;

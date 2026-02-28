import { useState, useCallback } from 'react';
import Header from './components/Header';
import TimezoneList from './components/TimezoneList';
import { TimezoneInfo } from './components/Timezone';
import '@styles/_reset.css';
import '@styles/main.scss';

export type SortMode = 'newest' | 'time' | 'alphabet';

function App() {
  const [addTimezoneFn, setAddTimezoneFn] = useState<
    ((timezone: TimezoneInfo) => void) | null
  >(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const registerAddTimezone = useCallback(
    (fn: (timezone: TimezoneInfo) => void) => {
      setAddTimezoneFn(() => fn);
    },
    []
  );

  const handleAddTimezone = (timezone: TimezoneInfo) => {
    if (addTimezoneFn) {
      addTimezoneFn(timezone);
    }
  };

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

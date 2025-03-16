import { useState, useCallback } from 'react';
import Header from './components/Header';
import TimezoneList from './components/TimezoneList';
import { TimezoneInfo } from './components/Timezone';
import '@styles/_reset.css';
import '@styles/main.scss';

function App() {
  const [addTimezoneFn, setAddTimezoneFn] = useState<
    ((timezone: TimezoneInfo) => void) | null
  >(null);

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
      <Header addTimezone={handleAddTimezone} />
      <div className="app-content">
        <TimezoneList onAddTimezone={registerAddTimezone} />
      </div>
    </div>
  );
}

export default App;

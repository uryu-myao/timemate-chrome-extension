import { useState, useEffect, useCallback } from 'react';
import Timezone, { TimezoneInfo } from './Timezone';
import type { SortMode } from '../App';

const TIMEZONE_STORAGE_KEY = 'timemate.timezones.v1';

// 初始时区数据
const initialTimezones: TimezoneInfo[] = [];

const loadStoredTimezones = (): TimezoneInfo[] => {
  try {
    const raw = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (!raw) return initialTimezones;

    const parsed = JSON.parse(raw) as TimezoneInfo[];
    if (!Array.isArray(parsed)) return initialTimezones;

    const valid = parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.city === 'string' &&
        typeof item.zone === 'string'
    );

    return valid.length > 0 ? valid : initialTimezones;
  } catch {
    return initialTimezones;
  }
};

interface TimezoneListProps {
  onAddTimezone?: (timezone: (timezone: TimezoneInfo) => void) => void;
  sortMode: SortMode;
}

const getMinutesInZone = (zone: string): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return hour * 60 + minute;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
};

const TimezoneList: React.FC<TimezoneListProps> = ({
  onAddTimezone,
  sortMode,
}) => {
  const [timezones, setTimezones] =
    useState<TimezoneInfo[]>(loadStoredTimezones);
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [, setTimeSortTick] = useState(0);

  // 切换设置状态
  const toggleSetting = (id: string) => {
    setActiveSettingId((prev) => (prev === id ? null : id));
  };

  // 删除时区
  const deleteTimezone = (id: string) => {
    setTimezones((prev) => prev.filter((tz) => tz.id !== id));
    setPinnedIds((prev) => prev.filter((tid) => tid !== id));
    if (activeSettingId === id) {
      setActiveSettingId(null);
    }
  };

  // 固定时区
  const pinTimezone = (id: string) => {
    setPinnedIds((prev) => [...prev.filter((tid) => tid !== id), id]);
    setActiveSettingId(null); // 取消 setting 状态
  };

  // 取消固定
  const unpinTimezone = (id: string) => {
    setPinnedIds((prev) => prev.filter((tid) => tid !== id));
    if (activeSettingId === id) {
      setActiveSettingId(null);
    }
  };

  // 使用useCallback包装addTimezone函数，避免不必要的重新创建
  const addTimezone = useCallback((newTimezone: TimezoneInfo) => {
    // 允许相同时区的不同城市；仅阻止完全重复（同 city + zone）
    setTimezones((prev) => {
      if (
        prev.some(
          (tz) =>
            tz.zone === newTimezone.zone &&
            tz.city.toLowerCase() === newTimezone.city.toLowerCase()
        )
      ) {
        return prev; // 如果已存在，返回原数组
      }
      return [...prev, newTimezone]; // 否则添加新时区
    });
  }, []);

  // 使用useEffect在组件挂载后注册方法，而不是在渲染过程中
  useEffect(() => {
    if (onAddTimezone) {
      onAddTimezone(addTimezone);
    }
  }, [onAddTimezone, addTimezone]); // 正确添加所有依赖项

  useEffect(() => {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, JSON.stringify(timezones));
  }, [timezones]);

  useEffect(() => {
    if (sortMode !== 'time') return;

    const intervalId = setInterval(() => {
      setTimeSortTick((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [sortMode]);

  const compareByMode = (a: TimezoneInfo, b: TimezoneInfo): number => {
    if (sortMode === 'alphabet') {
      return a.city.localeCompare(b.city);
    }

    if (sortMode === 'time') {
      return getMinutesInZone(a.zone) - getMinutesInZone(b.zone);
    }

    // "newest(default)" per requirement note: added earlier first.
    return 0;
  };

  // 置顶始终在前；同组内按排序命令排序。
  const sortedTimezones = [...timezones].sort((a, b) => {
    const isPinnedA = pinnedIds.includes(a.id);
    const isPinnedB = pinnedIds.includes(b.id);
    if (isPinnedA !== isPinnedB) {
      return isPinnedA ? -1 : 1;
    }

    return compareByMode(a, b);
  });

  return (
    <div className="timezone-list">
      {sortedTimezones.length === 0 ? (
        <div className="timezone-list__empty">
          <p className="timezone-list__empty-text">
            Press <span className="timezone-list__empty-addicon"></span> to add
            your first city.
          </p>
        </div>
      ) : (
        sortedTimezones.map((tz) => (
          <Timezone
            key={tz.id}
            id={tz.id}
            city={tz.city}
            zone={tz.zone}
            setting={activeSettingId === tz.id}
            isPinned={pinnedIds.includes(tz.id)}
            toggleSetting={() => toggleSetting(tz.id)}
            deleteTimezone={() => deleteTimezone(tz.id)}
            pinTimezone={() => pinTimezone(tz.id)}
            unpinTimezone={() => unpinTimezone(tz.id)}
          />
        ))
      )}
    </div>
  );
};

export default TimezoneList;

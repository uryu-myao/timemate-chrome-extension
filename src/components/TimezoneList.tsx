import { useState, useEffect, useCallback } from 'react';
import Timezone, { TimezoneInfo } from './Timezone';
import type { AddTimezoneResult, SortMode } from '../App';

const TIMEZONE_STORAGE_KEY = 'timemate.timezones.v1';
const TIMEZONE_PINNED_STORAGE_KEY = 'timemate.pinned.v1';
const MAX_CITIES = 10;

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

    // Migrate legacy seeded defaults (tokyo/newyork/rome) to empty list.
    const legacySeedIds = ['tokyo', 'newyork', 'rome'];
    const isLegacySeed =
      valid.length === legacySeedIds.length &&
      legacySeedIds.every((id) => valid.some((item) => item.id === id));
    if (isLegacySeed) {
      return [];
    }

    return valid.slice(0, MAX_CITIES);
  } catch {
    return initialTimezones;
  }
};

const loadStoredPinnedIds = (validTimezoneIds: string[]): string[] => {
  try {
    const raw = localStorage.getItem(TIMEZONE_PINNED_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];

    const validIdSet = new Set(validTimezoneIds);
    return parsed.filter(
      (id) => typeof id === 'string' && validIdSet.has(id)
    );
  } catch {
    return [];
  }
};

interface TimezoneListProps {
  onAddTimezone?: (
    timezone: (timezone: TimezoneInfo) => AddTimezoneResult
  ) => void;
  sortMode: SortMode;
}

const getDateTimeRankInZone = (zone: string): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const year = Number(parts.find((p) => p.type === 'year')?.value ?? 0);
    const month = Number(parts.find((p) => p.type === 'month')?.value ?? 0);
    const day = Number(parts.find((p) => p.type === 'day')?.value ?? 0);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    const second = Number(parts.find((p) => p.type === 'second')?.value ?? 0);

    // Compare by local date first, then local time (YYYYMMDDHHmmss).
    return (
      year * 10000000000 +
      month * 100000000 +
      day * 1000000 +
      hour * 10000 +
      minute * 100 +
      second
    );
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
};

const TimezoneList: React.FC<TimezoneListProps> = ({
  onAddTimezone,
  sortMode,
}) => {
  const [timezones, setTimezones] = useState<TimezoneInfo[]>(() =>
    loadStoredTimezones()
  );
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const storedTimezones = loadStoredTimezones();
    return loadStoredPinnedIds(storedTimezones.map((tz) => tz.id));
  });
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
  const addTimezone = useCallback((newTimezone: TimezoneInfo): AddTimezoneResult => {
    let result: AddTimezoneResult = 'duplicate';

    // 允许相同时区的不同城市；仅阻止完全重复（同 city + zone）
    setTimezones((prev) => {
      if (
        prev.some(
          (tz) =>
            tz.zone === newTimezone.zone &&
            tz.city.toLowerCase() === newTimezone.city.toLowerCase()
        )
      ) {
        result = 'duplicate';
        return prev; // 如果已存在，返回原数组
      }

      if (prev.length >= MAX_CITIES) {
        result = 'limit';
        return prev;
      }

      result = 'added';
      return [...prev, newTimezone]; // 否则添加新时区
    });

    return result;
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
    const validIdSet = new Set(timezones.map((tz) => tz.id));
    setPinnedIds((prev) => {
      const next = prev.filter((id) => validIdSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [timezones]);

  useEffect(() => {
    localStorage.setItem(TIMEZONE_PINNED_STORAGE_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    if (sortMode !== 'time') return;

    const intervalId = setInterval(() => {
      setTimeSortTick((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [sortMode]);

  useEffect(() => {
    if (!activeSettingId) return;

    const handleClickOutsideActiveCard = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest('[data-timezone-id]') as
        | HTMLElement
        | null;
      const clickedId = card?.dataset.timezoneId ?? null;

      if (clickedId !== activeSettingId) {
        setActiveSettingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideActiveCard);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideActiveCard);
    };
  }, [activeSettingId]);

  const timezoneOrder = new Map(timezones.map((tz, index) => [tz.id, index]));

  const compareByMode = (a: TimezoneInfo, b: TimezoneInfo): number => {
    if (sortMode === 'alphabet') {
      return a.city.localeCompare(b.city);
    }

    if (sortMode === 'time') {
      return getDateTimeRankInZone(a.zone) - getDateTimeRankInZone(b.zone);
    }

    // newest(default): recently added first
    const orderA = timezoneOrder.get(a.id) ?? 0;
    const orderB = timezoneOrder.get(b.id) ?? 0;
    return orderB - orderA;
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

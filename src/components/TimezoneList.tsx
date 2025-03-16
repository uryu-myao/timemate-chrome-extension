import { useState, useEffect, useCallback } from 'react';
import Timezone, { TimezoneInfo } from './Timezone';

// 初始时区数据
const initialTimezones: TimezoneInfo[] = [
  { id: 'tokyo', city: 'Tokyo', zone: 'Asia/Tokyo' },
  { id: 'newyork', city: 'New York', zone: 'America/New_York' },
  { id: 'rome', city: 'Rome', zone: 'Europe/Rome' },
];

interface TimezoneListProps {
  onAddTimezone?: (timezone: (timezone: TimezoneInfo) => void) => void;
}

const TimezoneList: React.FC<TimezoneListProps> = ({ onAddTimezone }) => {
  const [timezones, setTimezones] = useState<TimezoneInfo[]>(initialTimezones);
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

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
  };

  // 使用useCallback包装addTimezone函数，避免不必要的重新创建
  const addTimezone = useCallback((newTimezone: TimezoneInfo) => {
    // 检查是否已存在相同ID的时区
    setTimezones((prev) => {
      if (prev.some((tz) => tz.id === newTimezone.id)) {
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

  // 按固定状态排序（固定的在前面）
  const sortedTimezones = [...timezones].sort((a, b) => {
    const isPinnedA = pinnedIds.includes(a.id);
    const isPinnedB = pinnedIds.includes(b.id);
    if (isPinnedA === isPinnedB) return 0;
    return isPinnedA ? -1 : 1;
  });

  return (
    <div className="timezone-list">
      {sortedTimezones.map((tz) => (
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
      ))}
    </div>
  );
};

export default TimezoneList;

import { useState } from 'react';
import Timezone, { TimezoneInfo } from './Timezone';

// 初始 Timezone 数据
const initialTimezones: TimezoneInfo[] = [
  { id: 'tokyo', city: 'Tokyo', zone: 'Asia/Tokyo' },
  { id: 'newyork', city: 'New York', zone: 'America/New_York' },
];

const TimezoneList = () => {
  // 用 useState 维护 timezones 状态
  const [timezones, setTimezones] = useState<TimezoneInfo[]>(initialTimezones);
  // 当前激活设置状态的 Timezone ID
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);

  // 切换设置状态
  const toggleSetting = (id: string) => {
    setActiveSettingId((prev) => (prev === id ? null : id));
  };

  // 删除指定的 Timezone
  const deleteTimezone = (id: string) => {
    setTimezones((prev) => prev.filter((tz) => tz.id !== id));
    if (activeSettingId === id) {
      setActiveSettingId(null); // 如果删除的是激活的，关闭设置状态
    }
  };

  return (
    <div className="timezone-list">
      {timezones.map((tz) => (
        <Timezone
          key={tz.id}
          id={tz.id}
          city={tz.city}
          zone={tz.zone}
          setting={activeSettingId === tz.id}
          toggleSetting={() => toggleSetting(tz.id)}
          deleteTimezone={() => deleteTimezone(tz.id)}
        />
      ))}
    </div>
  );
};

export default TimezoneList;

import { useState } from 'react';
import Timezone, { TimezoneInfo } from './Timezone';

// 定义每个 Timezone 数据的接口
const initialTimezones: TimezoneInfo[] = [
  { id: 'tokyo', city: 'Tokyo', zone: 'Asia/Tokyo' },
  { id: 'newyork', city: 'New York', zone: 'America/New_York' },
];

const TimezoneList = () => {
  // 当前激活设置状态的 Timezone 的 id，如果没有激活则为 null
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);

  // 当某个 Timezone 的设置按钮被点击时，切换该 Timezone 的设置状态，
  // 如果当前激活的 id 与该组件 id 相同，则置为 null（关闭），否则更新为新 id。
  const toggleSetting = (id: string) => {
    setActiveSettingId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="timezone-list">
      {initialTimezones.map((tz) => (
        <Timezone
          key={tz.id}
          id={tz.id}
          city={tz.city}
          zone={tz.zone}
          setting={activeSettingId === tz.id} // 传入当前是否处于设置状态
          toggleSetting={() => toggleSetting(tz.id)}
        />
      ))}
    </div>
  );
};
export default TimezoneList;

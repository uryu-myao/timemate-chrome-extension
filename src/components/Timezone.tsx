import { useState, useEffect } from 'react';
import '@styles/_reset.css';
import '@styles/Timezone.scss';
import SettingButton from './SettingButton';
import PinButton from './PinButton';
import DeleteButton from './DeleteButton';

export interface TimezoneInfo {
  id: string;
  city: string;
  zone: string;
}

interface TimezoneProps extends TimezoneInfo {
  setting: boolean;
  isPinned: boolean;
  toggleSetting: (id: string) => void;
  deleteTimezone: () => void;
  pinTimezone: () => void;
  unpinTimezone: () => void;
}

const Timezone: React.FC<TimezoneProps> = ({
  id,
  city,
  zone,
  setting,
  isPinned,
  toggleSetting,
  deleteTimezone,
  pinTimezone,
  unpinTimezone,
}) => {
  const [timeData, setTimeData] = useState({
    city,
    offset: '',
    time: '',
    second: '',
    meridiem: '',
    week: '',
    date: '',
    month: '',
  });

  // ✅ 计算并格式化时区偏移量
  const getTimezoneOffsetString = (timeZone: string): string => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset',
      });
      const parts = formatter.formatToParts(now);
      const tzOffset = parts.find((p) => p.type === 'timeZoneName')?.value;
      return tzOffset
        ? tzOffset.replace('GMT', 'UTC').replace(':00', '')
        : 'N/A';
    } catch (error) {
      console.error('⚠️ 获取时区偏移量失败:', error);
      return 'N/A';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date(
        new Date().toLocaleString('en-US', { timeZone: zone })
      );
      setTimeData((prev) => ({
        ...prev,
        time: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        second: now.getSeconds().toString().padStart(2, '0'),
        meridiem: now.getHours() < 12 ? 'AM' : 'PM',
        week: now
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase(),
        date: now.getDate().toString(),
        month: now
          .toLocaleDateString('en-US', { month: 'short' })
          .toLowerCase(),
        offset: getTimezoneOffsetString(zone), // ✅ 添加 offset 更新
      }));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [zone]);

  return (
    <div className={`timezone ${setting ? 'setting' : ''}`}>
      <div className="timezone-inner">
        <div className="timezone-data__location">{timeData.city}</div>
        <div className="timezone-data__time">{timeData.time}</div>
        <div className="timezone-data__meridiem">{timeData.meridiem}</div>
        <div className="timezone-data__second">{timeData.second}</div>
        <div className="timezone-footer">
          <p>
            <span className="timezone-data__offset">
              {timeData.offset || 'N/A'}
            </span>
          </p>
          <p>
            <span className="timezone-data__week">{timeData.week}</span>
            <span>
              <span className="timezone-data__date">{timeData.date}</span>
              <span className="timezone-data__month">{timeData.month}</span>
            </span>
          </p>
        </div>
      </div>
      <SettingButton onClick={() => toggleSetting(id)} />
      <div className="timezone-btn">
        <PinButton
          isPinned={isPinned}
          onClick={() => {
            if (isPinned) {
              unpinTimezone();
            } else {
              pinTimezone();
              toggleSetting(id);
            }
          }}
        />
        <DeleteButton onClick={deleteTimezone} />
      </div>
    </div>
  );
};

export default Timezone;

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
  setting: boolean; // 当前是否处于设置状态，由父组件控制
  toggleSetting: (id: string) => void; // 切换设置状态的回调
  deleteTimezone: () => void; // 删除该 Timezone 的回调
}

interface TimeData {
  city: string;
  offset: string;
  time: string;
  second: string;
  meridiem: string;
  week: string;
  date: string;
  month: string;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatDate = (date: Date) => {
  return {
    week: date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
    date: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(),
    meridiem: date.getHours() < 12 ? 'AM' : 'PM',
  };
};

/**
 * 使用 Intl.DateTimeFormat 获取指定时区的偏移量字符串，
 * 返回类似 "UTC+9" 或 "UTC-4"
 */
const getTimezoneOffsetString = (timeZone: string): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value;
    return tzName ? tzName.replace('GMT', 'UTC').replace(':00', '') : 'N/A';
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 'N/A';
  }
};

const Timezone: React.FC<TimezoneProps> = ({
  id,
  city,
  zone,
  setting,
  toggleSetting,
  deleteTimezone,
}) => {
  const [timeData, setTimeData] = useState<TimeData>({
    city,
    offset: '',
    time: '',
    second: '',
    meridiem: '',
    week: '',
    date: '',
    month: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await fetch(
          `https://timeapi.io/api/Time/current/zone?timeZone=${zone}`
        );
        const data = await response.json();
        console.log('Fetched time data for', city, data);
        // 使用当前时间的字符串表示，确保指定了目标时区
        const nowString = new Date().toLocaleString('en-US', {
          timeZone: zone,
        });
        const now = new Date(nowString);
        const offset = getTimezoneOffsetString(data.timeZone);
        setTimeData({
          city,
          offset,
          time: formatTime(now),
          second: now.getSeconds().toString().padStart(2, '0'),
          ...formatDate(now),
        });
      } catch (error) {
        console.error('Failed to fetch time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeData(); // 初次获取数据
    const intervalId = setInterval(() => {
      // 使用指定时区更新当前时间
      const nowString = new Date().toLocaleString('en-US', {
        timeZone: zone,
      });
      const nowTime = new Date(nowString);
      setTimeData((prev) => ({
        ...prev,
        time: formatTime(nowTime),
        second: nowTime.getSeconds().toString().padStart(2, '0'),
        ...formatDate(nowTime),
      }));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [zone, city]);

  return (
    <div className={`timezone ${setting ? 'setting' : ''}`}>
      <div className="timezone-inner">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
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
          </>
        )}
      </div>
      {/* 点击 SettingButton 时调用传入的 toggleSetting 回调，并传递当前组件 id */}
      <SettingButton onClick={() => toggleSetting(id)} />
      <div className="timezone-btn">
        <PinButton />
        {/* 点击 DeleteButton 时调用传入的 deleteTimezone 回调 */}
        <DeleteButton onClick={deleteTimezone} />
      </div>
    </div>
  );
};

export default Timezone;

import { useState, useEffect } from 'react';
import '@styles/_reset.css';
import '@styles/Timezone.scss';
import SettingButton from './SettingButton';
import PinButton from './PinButton';
import DeleteButton from './DeleteButton';

// 定义 TimeData 接口，用于描述时间数据的结构
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

// 格式化时间（时:分，24小时制，不显示秒）
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// 格式化日期，返回星期、日、月和 AM/PM 信息
const formatDate = (date: Date) => {
  return {
    week: date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
    date: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(),
    meridiem: date.getHours() < 12 ? 'AM' : 'PM',
  };
};

/**
 * 根据指定时区，使用 Intl.DateTimeFormat 动态获取当前偏移量字符串。
 * 例如对于 "Asia/Tokyo"，可能返回 "UTC+9"。
 */
const getTimezoneOffsetString = (timeZone: string): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(now);
  const tzName = parts.find((p) => p.type === 'timeZoneName')?.value;
  return tzName ? tzName.replace('GMT', 'UTC') : '';
};

const Timezone = () => {
  // 初始化时间数据状态，字段初始为空字符串
  const [timeData, setTimeData] = useState<TimeData>({
    city: 'Tokyo',
    offset: '',
    time: '',
    second: '',
    meridiem: '',
    week: '',
    date: '',
    month: '',
  });
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 控制设置按钮切换状态
  const [setting, setSetting] = useState(false);
  // 切换设置状态（例如：点击 SettingButton 后，触发 Timezone 右移 60px 等样式变化）
  const toggleSetting = () => {
    setSetting((prev) => !prev);
  };
  // 使用 timeapi.io API 获取东京当前时间数据
  const fetchTimeData = async () => {
    try {
      const response = await fetch(
        'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo'
      );
      const data = await response.json();
      console.log('Fetched time data:', data); // 打印返回数据以供调试
      // data.dateTime 例如 "2025-01-20T17:27:06.123"
      const now = new Date(data.dateTime);
      // 动态获取偏移量字符串，例如 "UTC+9"
      const offset = getTimezoneOffsetString(data.timeZone);
      setTimeData({
        city: 'Tokyo',
        offset: offset,
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

  // 在组件挂载时获取初始数据，并设置每秒更新显示的时间
  useEffect(() => {
    fetchTimeData(); // 初次获取数据
    const intervalId = setInterval(() => {
      const nowTime = new Date();
      setTimeData((prev) => ({
        ...prev,
        time: formatTime(nowTime),
        second: nowTime.getSeconds().toString().padStart(2, '0'),
        ...formatDate(nowTime),
      }));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

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
      <SettingButton onClick={toggleSetting} />
      <div className="timezone-btn">
        <PinButton />
        <DeleteButton />
      </div>
    </div>
  );
};

export default Timezone;

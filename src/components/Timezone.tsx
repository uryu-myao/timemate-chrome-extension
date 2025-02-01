import { useState, useEffect } from 'react';
import '@styles/_reset.css';
import '@styles/Timezone.scss';
import SettingButton from './SettingButton';
import PinButton from './PinButton';
import DeleteButton from './DeleteButton';

interface TimeData {
  city: string;
  timezone: string;
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

const Timezone = () => {
  const [timeData, setTimeData] = useState<TimeData>({
    city: 'Tokyo',
    timezone: '',
    offset: '',
    time: '',
    second: '',
    meridiem: '',
    week: '',
    date: '',
    month: '',
  });
  const [loading, setLoading] = useState(true); // 保留 loading 状态
  const [Setting, setSetting] = useState(false); // 是否移动状态

  const toggleSetting = () => {
    setSetting((prev) => !prev); // 切换移动状态
  };

  const fetchTimeData = async () => {
    try {
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${
          import.meta.env.VITE_TIMEZONE_API_KEY
        }&format=json&by=zone&zone=Asia/Tokyo`
      );
      const data = await response.json();
      const now = new Date(data.formatted);
      setTimeData({
        city: 'Tokyo',
        timezone: data.abbreviation.toLowerCase(),
        offset: `utc${data.gmtOffset / 3600}`,
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
    <div className={`timezone ${Setting ? 'setting' : ''}`}>
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
                <span className="timezone-data__tz">{timeData.timezone}</span>
                <span className="timezone-data__offset">{timeData.offset}</span>
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

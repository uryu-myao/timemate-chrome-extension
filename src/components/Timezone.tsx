import { useEffect, useState } from 'react';
import '@styles/_reset.css';
import '@styles/Timezone.scss';

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
  sunrise: string;
  sunset: string;
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

const parseTime = (timeString: string) => {
  if (!timeString || typeof timeString !== 'string') {
    throw new Error('Invalid time string');
  }

  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return new Date().setHours(hours, minutes, seconds || 0);
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
    sunrise: '',
    sunset: '',
  });
  const [loading, setLoading] = useState(true); // 保留 loading 状态
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await fetch(
          `https://api.timezonedb.com/v2.1/get-time-zone?key=${
            import.meta.env.VITE_TIMEZONE_API_KEY
          }&format=json&by=zone&zone=Asia/Tokyo`
        );
        const data = await response.json();
        console.log('Fetched time data:', data); // 确保数据正确获取

        const now = new Date(data.formatted);
        const sunrise = parseTime(data.sunrise);
        const sunset = parseTime(data.sunset);
        setIsDay(now.getTime() >= sunrise && now.getTime() < sunset);

        setTimeData({
          city: 'Tokyo',
          timezone: data.abbreviation,
          offset: `utc${data.gmtOffset / 3600}`,
          time: formatTime(now),
          second: now.getSeconds().toString().padStart(2, '0'),
          ...formatDate(now),
          sunrise: data.sunrise,
          sunset: data.sunset,
        });
      } catch (error) {
        console.error('Failed to fetch time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeData(); // 初次获取数据

    const intervalId = setInterval(() => {
      const nowTime = new Date();
      setTimeData((prev) => ({
        ...prev,
        time: formatTime(nowTime),
        second: nowTime.getSeconds().toString().padStart(2, '0'),
        ...formatDate(nowTime),
      }));
      setIsDay(
        nowTime.getTime() >= parseTime(timeData.sunrise) &&
          nowTime.getTime() < parseTime(timeData.sunset)
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeData.sunrise, timeData.sunset]); // 注意这里依赖的是 timeData.sunrise 和 timeData.sunset

  const theme = document.documentElement.getAttribute('data-theme');
  const timezoneClass = `timezone ${
    theme === 'light'
      ? isDay
        ? 'sunrise-light'
        : 'sunset-light'
      : isDay
      ? 'sunrise-dark'
      : 'sunset-dark'
  }`;

  return (
    <div className={timezoneClass}>
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
                <span className="timezone-data__tz">
                  {timeData.timezone || 'N/A'}
                </span>
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
    </div>
  );
};

export default Timezone;

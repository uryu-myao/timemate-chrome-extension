import { useEffect, useState } from 'react';
import '../styles/_reset.css';
import '../styles/Timezone.scss';

interface TimeData {
  city: string;
  timezone: string;
  offset: string;
  time: string;
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
    meridiem: '',
    week: '',
    date: '',
    month: '',
  });
  const [loading, setLoading] = useState(true); // 保留 loading 状态
  const [lastFetched, setLastFetched] = useState<number>(0); // 缓存上次请求时间的时间戳

  // 获取初始数据并更新
  const fetchTimeData = async () => {
    const now = Date.now();
    if (now - lastFetched < 30000) {
      // 如果上次获取数据的时间距离现在小于 30 秒，则不发送请求
      return;
    }

    try {
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${
          import.meta.env.VITE_TIMEZONE_API_KEY
        }&format=json&by=zone&zone=Asia/Tokyo`
      );
      const data = await response.json();
      const nowTime = new Date(data.formatted);

      setTimeData((prev) => ({
        ...prev,
        timezone: data.abbreviation.toLowerCase(),
        offset: `utc${data.gmtOffset / 3600}`,
        ...formatDate(nowTime),
        time: formatTime(nowTime),
      }));
      setLastFetched(now); // 更新最后一次请求的时间
    } catch (error) {
      console.error('Failed to fetch time data:', error);
    } finally {
      setLoading(false); // 数据加载完成后将 loading 设置为 false
    }
  };

  useEffect(() => {
    fetchTimeData(); // 初次获取数据
    const intervalId = setInterval(() => {
      fetchTimeData(); // 定时检查并请求数据
    }, 1000); // 每秒调用，但只有在上次请求后 30 秒才真正请求数据

    return () => clearInterval(intervalId); // 清除定时器
  }, [lastFetched]);

  return (
    <div className="timezone">
      <div className="timezone-inner">
        {loading ? (
          <div className="loading">Loading...</div> // 渲染加载动画
        ) : (
          <>
            <div className="timezone__location">{timeData.city}</div>
            <div className="timezone__time">{timeData.time}</div>
            <div className="timezone__meridiem">{timeData.meridiem}</div>
            <div className="timezone-footer">
              <p>
                <span className="timezone__tz">{timeData.timezone}</span>
                <span className="timezone__offset">{timeData.offset}</span>
              </p>
              <p>
                <span className="timezone__week">{timeData.week}</span>
                <span>
                  <span className="timezone__date">{timeData.date}</span>
                  <span className="timezone__month">{timeData.month}</span>
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

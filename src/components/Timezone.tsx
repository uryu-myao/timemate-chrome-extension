import { useEffect, useState } from 'react';
import '../styles/_reset.css';
import '../styles/Timezone.scss';

interface TimeData {
  city: string;
  timezone: string;
  offset: string;
  time: string;
  week: string;
  date: string;
  month: string;
}

const Timezone = () => {
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loading, setLoading] = useState(true);

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
        time: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        week: now
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase(),
        date: now.getDate().toString(),
        month: now
          .toLocaleDateString('en-US', { month: 'short' })
          .toLowerCase(),
      });
    } catch (error) {
      console.error('Failed to fetch time data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 定时更新时间
  useEffect(() => {
    fetchTimeData(); // 首次获取数据
    const intervalId = setInterval(() => {
      const now = new Date();
      setTimeData((prev) => ({
        ...prev!, // 保持之前的数据
        time: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }), // 更新时间
        week: now
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase(),
        date: now.getDate().toString(),
        month: now
          .toLocaleDateString('en-US', { month: 'short' })
          .toLowerCase(),
      }));
    }, 1000); // 每秒更新时间

    return () => clearInterval(intervalId); // 清除定时器
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="timezone">
      <div className="timezone-inner">
        <div className="timezone__location">{timeData?.city}</div>
        <div className="timezone__time">{timeData?.time}</div>
        <div className="timezone-footer">
          <p>
            <span className="timezone__tz">{timeData?.timezone}</span>
            <span className="timezone__offset">{timeData?.offset}</span>
          </p>
          <p>
            <span className="timezone__week">{timeData?.week}</span>
            <span>
              <span className="timezone__date">{timeData?.date}</span>
              <span className="timezone__month">{timeData?.month}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timezone;

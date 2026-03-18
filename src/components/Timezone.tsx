import { useState, useEffect } from 'react';
import '@styles/_reset.css';
import '@styles/Timezone.scss';
import SettingButton from './SettingButton';
import PinButton from './PinButton';
import DeleteButton from './DeleteButton';
import type { ConvertPosition, HourFormat } from '../App';

export interface TimezoneInfo {
  id: string;
  city: string;
  zone: string;
}

interface TimezoneProps extends TimezoneInfo {
  hourFormat: HourFormat;
  isConvertModeOpen: boolean;
  convertPosition: ConvertPosition;
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
  hourFormat,
  isConvertModeOpen,
  convertPosition,
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
      const getTargetDateParts = (date: Date, timeZone: string) => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          weekday: 'short',
          hour12: isConvertModeOpen ? false : hourFormat === '12',
        }).formatToParts(date);

        return {
          year: Number(parts.find((p) => p.type === 'year')?.value ?? 0),
          monthNumber: Number(parts.find((p) => p.type === 'month')?.value ?? 0),
          dayNumber: Number(parts.find((p) => p.type === 'day')?.value ?? 0),
          hour: parts.find((p) => p.type === 'hour')?.value ?? '00',
          minute: parts.find((p) => p.type === 'minute')?.value ?? '00',
          second: parts.find((p) => p.type === 'second')?.value ?? '00',
          weekday:
            parts.find((p) => p.type === 'weekday')?.value.toLowerCase() ?? '',
          dayPeriod: parts.find((p) => p.type === 'dayPeriod')?.value ?? '',
          monthShort: date
            .toLocaleDateString('en-US', { timeZone, month: 'short' })
            .toLowerCase(),
        };
      };

      const now = new Date();
      const baseSourceDate = new Date(now);
      baseSourceDate.setHours(0, 0, 0, 0);
      const converterHours = convertPosition * 3;
      const roundedHalfHours = Math.round(converterHours * 2) / 2;
      const converterHour = Math.floor(roundedHalfHours);
      const converterMinute = roundedHalfHours % 1 === 0.5 ? 30 : 0;

      const sourceDate = new Date(now);
      if (isConvertModeOpen) {
        sourceDate.setHours(converterHour, converterMinute, 0, 0);
      }

      const targetParts = getTargetDateParts(sourceDate, zone);
      const sourceDateKey =
        baseSourceDate.getFullYear() * 10000 +
        (baseSourceDate.getMonth() + 1) * 100 +
        baseSourceDate.getDate();
      const targetDateKey =
        targetParts.year * 10000 +
        targetParts.monthNumber * 100 +
        targetParts.dayNumber;
      const dayOffset =
        targetDateKey > sourceDateKey ? 1 : targetDateKey < sourceDateKey ? -1 : 0;

      setTimeData((prev) => ({
        ...prev,
        time: `${targetParts.hour}:${targetParts.minute}`,
        second: isConvertModeOpen
          ? ''
          : targetParts.second.padStart(2, '0'),
        meridiem: isConvertModeOpen
          ? dayOffset > 0
            ? `+${dayOffset}`
            : dayOffset < 0
              ? `${dayOffset}`
              : ''
          : hourFormat === '12'
            ? targetParts.dayPeriod.toUpperCase()
            : '',
        week: targetParts.weekday,
        date: targetParts.dayNumber.toString(),
        month: targetParts.monthShort,
        offset: getTimezoneOffsetString(zone), // ✅ 添加 offset 更新
      }));
    };

    updateTime();
    if (isConvertModeOpen) {
      return;
    }

    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [zone, hourFormat, isConvertModeOpen, convertPosition]);

  return (
    <div
      data-timezone-id={id}
      className={`timezone ${setting ? 'setting' : ''} ${
        isPinned ? 'pinned' : ''
      }`}>
      <div className="timezone-inner">
        <div className="timezone-data__location">{timeData.city}</div>
        <div className="timezone-data__time">{timeData.time}</div>
        {(isConvertModeOpen || hourFormat === '12') && timeData.meridiem && (
          <div className="timezone-data__meridiem">{timeData.meridiem}</div>
        )}
        {!isConvertModeOpen && (
          <div className="timezone-data__second">{timeData.second}</div>
        )}
        <div className="timezone-footer">
          <p>
            <span className="timezone-data__offset">
              {timeData.offset || 'N/A'}
            </span>
          </p>
          <p>
            {isConvertModeOpen ? (
              <span>Converter Mode</span>
            ) : (
              <span>
                <span className="timezone-data__week">{timeData.week}</span>
                <span>
                  <span className="timezone-data__date">{timeData.date}</span>
                  <span className="timezone-data__month">{timeData.month}</span>
                </span>
              </span>
            )}
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
            }
          }}
        />
        <DeleteButton onClick={deleteTimezone} />
      </div>
    </div>
  );
};

export default Timezone;

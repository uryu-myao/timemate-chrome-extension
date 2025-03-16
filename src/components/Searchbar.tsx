import { useState, useEffect, useRef } from 'react';
import '@styles/Searchbar.scss';

interface SearchResult {
  id: string;
  city: string;
  zone: string;
}

interface SearchbarProps {
  addTimezone: (timezone: { id: string; city: string; zone: string }) => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ addTimezone }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 模拟API调用获取城市时区数据
  const fetchCityTimezones = async (query: string): Promise<SearchResult[]> => {
    // 这里替换为实际API调用
    setIsLoading(true);

    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 模拟API响应数据 - 实际实现中替换为真实API调用
      const allCities = [
        { id: 'shanghai', city: 'Shanghai', zone: 'Asia/Shanghai' },
        { id: 'beijing', city: 'Beijing', zone: 'Asia/Shanghai' },
        { id: 'hongkong', city: 'Hong Kong', zone: 'Asia/Hong_Kong' },
        { id: 'taipei', city: 'Taipei', zone: 'Asia/Taipei' },
        { id: 'tokyo', city: 'Tokyo', zone: 'Asia/Tokyo' },
        { id: 'seoul', city: 'Seoul', zone: 'Asia/Seoul' },
        { id: 'singapore', city: 'Singapore', zone: 'Asia/Singapore' },
        { id: 'london', city: 'London', zone: 'Europe/London' },
        { id: 'paris', city: 'Paris', zone: 'Europe/Paris' },
        { id: 'berlin', city: 'Berlin', zone: 'Europe/Berlin' },
        { id: 'newyork', city: 'New York', zone: 'America/New_York' },
        { id: 'losangeles', city: 'Los Angeles', zone: 'America/Los_Angeles' },
        { id: 'sydney', city: 'Sydney', zone: 'Australia/Sydney' },
      ];

      if (!query.trim()) return [];

      return allCities.filter((city) =>
        city.city.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('搜索城市时出错:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // 处理点击选择城市
  const handleSelectCity = (result: SearchResult) => {
    addTimezone(result);
    setSearchTerm('');
    setShowResults(false);
  };

  // 点击外部关闭结果列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 搜索词变化时获取结果
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm.trim()) {
        const searchResults = await fetchCityTimezones(searchTerm);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  return (
    <div className="search-inner" ref={searchRef}>
      <div className="search-input__container">
        <input
          className="search-input__field"
          type="text"
          placeholder="Search cities..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {showResults && (
        <div className="search-results">
          {isLoading ? (
            <div className="search-loading">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleSelectCity(result)}
                  className="search-result__item">
                  <span className="city-name">{result.city}</span>
                  <span className="timezone-name">
                    {result.zone.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : searchTerm.trim() ? (
            <div className="search-no-results">No cities found</div>
          ) : null}
        </div>
      )}

      {/* <p className="timezone-subtext">
        For city time reference only. Not for precise timekeeping.
      </p> */}
    </div>
  );
};

export default Searchbar;

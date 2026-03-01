import { useState, useEffect, useRef, useCallback } from 'react';
import '@styles/Searchbar.scss';
import type { AddTimezoneResult } from '../App';

interface SearchResult {
  id: string;
  city: string;
  zone: string;
  country?: string;
  region?: string;
}

interface SearchApiItem {
  city?: string;
  timezone?: string;
  country?: string;
  region?: string;
}

interface OpenMeteoResultItem {
  name?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface OpenMeteoSearchResponse {
  results?: OpenMeteoResultItem[];
}

const EMPTY_ZONES: string[] = [];

interface SearchbarProps {
  addTimezone: (timezone: SearchResult) => AddTimezoneResult;
  existingZones?: string[];
  onSelect?: () => void;
}

const Searchbar: React.FC<SearchbarProps> = ({
  addTimezone,
  existingZones = EMPTY_ZONES,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLimitTip, setShowLimitTip] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef(0);

  const fetchCityTimezones = useCallback(
    async (query: string, signal?: AbortSignal): Promise<SearchResult[]> => {
      try {
        // Use free Open-Meteo geocoding directly to avoid local proxy dependency.
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=8&language=en&format=json`,
          { signal }
        );
        const payload = (await res.json()) as OpenMeteoSearchResponse;
        const data: SearchApiItem[] = Array.isArray(payload.results)
          ? payload.results.map((item) => ({
              city: item.name,
              timezone: item.timezone,
              country: item.country,
              region: item.admin1,
            }))
          : [];

        if (!Array.isArray(data)) return [];

        const mapped = data
          .filter(
            (item) =>
              item.city &&
              item.timezone &&
              !existingZones.includes(item.timezone)
          )
          .map((item) => ({
            id: `${String(item.city)
              .toLowerCase()
              .replace(/[^\w]/g, '-')}-${String(item.timezone)
              .toLowerCase()
              .replace(/[^\w/]/g, '-')}`,
            city: item.city as string,
            zone: item.timezone as string,
            country: item.country,
            region: item.region,
          }));

        // Open-Meteo may return duplicates with same city/timezone.
        const unique = new Map<string, SearchResult>();
        for (const item of mapped) {
          if (!unique.has(item.id)) {
            unique.set(item.id, item);
          }
        }
        return Array.from(unique.values());
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return [];
        }
        console.error('搜索城市时出错:', error);
        return [];
      }
    },
    [existingZones]
  ); // ✅ 把依赖列上

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(!!value.trim());
    setShowLimitTip(false);
  };

  const handleSelectCity = (result: SearchResult) => {
    const addResult = addTimezone(result);
    if (addResult === 'limit') {
      setShowLimitTip(true);
      return;
    }

    setShowLimitTip(false);
    setSearchTerm('');
    setShowResults(false);
    setResults([]);
    onSelect?.();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setIsLoading((prev) => (prev ? false : prev));
      return;
    }

    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;
    const controller = new AbortController();

    const delaySearch = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await fetchCityTimezones(
        searchTerm,
        controller.signal
      );
      // Ignore stale responses from previous requests.
      if (requestId !== activeRequestIdRef.current) {
        return;
      }
      setResults(searchResults);
      setIsLoading(false);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(delaySearch);
    };
  }, [searchTerm, fetchCityTimezones]); // ✅ 正确标记依赖

  return (
    <div className="search-inner" ref={searchRef}>
      <div
        className={`search-input__container ${showLimitTip ? 'limit-reached' : ''}`}>
        <input
          ref={inputRef}
          className="search-input__field"
          type="text"
          placeholder="Search cities..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {showResults && (
        <div className="search-results">
          {results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleSelectCity(result)}
                  className="search-result__item">
                  <span className="city-name">
                    {result.city}
                    {result.region ? `, ${result.region}` : ''}
                    {result.country ? `, ${result.country}` : ''}
                  </span>
                  <span className="timezone-name">
                    {result.zone.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : isLoading ? (
            <div className="search-loading">Loading...</div>
          ) : (
            <div className="search-no-results">No cities found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Searchbar;

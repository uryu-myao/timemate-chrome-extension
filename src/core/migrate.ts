import { createDefaultAppData, createEntry, DEFAULT_SETTINGS, loadAppData, saveAppData } from './model';
import type { AppData, AppSettings, SortOrder } from './types';

const V1_TIMEZONES_KEY = 'timemate.timezones.v1';
const V1_PINNED_KEY = 'timemate.pinned.v1';
const V1_SORT_MODE_KEY = 'timemate.sort-mode.v1';
const V1_HOUR_FORMAT_KEY = 'timemate.hour-format.v1';
export const BACKUP_V1_STORAGE_KEY = 'timemate.backup_v1';

export interface V1TimezoneEntry {
  id: string;
  city: string;
  zone: string;
  lat?: number;
  lon?: number;
}

export type V1SortMode = 'newest' | 'time' | 'alphabet';
export type V1HourFormat = '12' | '24';

export interface V1Snapshot {
  timezones: V1TimezoneEntry[];
  pinnedIds: string[];
  sortMode: V1SortMode | null;
  hourFormat: V1HourFormat | null;
}

const SORT_MODE_TO_ORDER: Record<V1SortMode, SortOrder> = {
  newest: 'manual',
  time: 'offset',
  alphabet: 'name',
};

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function readV1Snapshot(): V1Snapshot {
  const timezones = safeParseArray<V1TimezoneEntry>(
    localStorage.getItem(V1_TIMEZONES_KEY)
  ).filter(
    (item): item is V1TimezoneEntry =>
      !!item &&
      typeof item.id === 'string' &&
      typeof item.city === 'string' &&
      typeof item.zone === 'string'
  );

  const pinnedIds = safeParseArray<string>(
    localStorage.getItem(V1_PINNED_KEY)
  ).filter((id) => typeof id === 'string');

  const sortModeRaw = localStorage.getItem(V1_SORT_MODE_KEY);
  const sortMode: V1SortMode | null =
    sortModeRaw === 'newest' || sortModeRaw === 'time' || sortModeRaw === 'alphabet'
      ? sortModeRaw
      : null;

  const hourFormatRaw = localStorage.getItem(V1_HOUR_FORMAT_KEY);
  const hourFormat: V1HourFormat | null =
    hourFormatRaw === '12' || hourFormatRaw === '24' ? hourFormatRaw : null;

  return { timezones, pinnedIds, sortMode, hourFormat };
}

// Pure: v1 city.timezone -> entry.timezone, city.name (city.city here) -> entry.label,
// membership in the old pinned-ids array -> entry.pinned. entry.id is freshly generated.
// Array order is preserved 1:1 from the stored v1 order.
export function mapV1ToV2(snapshot: V1Snapshot): AppData {
  const pinnedSet = new Set(snapshot.pinnedIds);

  const entries = snapshot.timezones.map((tz) =>
    createEntry({
      timezone: tz.zone,
      label: tz.city,
      pinned: pinnedSet.has(tz.id),
      lat: tz.lat,
      lon: tz.lon,
    })
  );

  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    hour24: snapshot.hourFormat ? snapshot.hourFormat === '24' : DEFAULT_SETTINGS.hour24,
    sortOrder: snapshot.sortMode
      ? SORT_MODE_TO_ORDER[snapshot.sortMode]
      : DEFAULT_SETTINGS.sortOrder,
  };

  return { version: 2, entries, groups: [], settings };
}

function backupV1Once(snapshot: V1Snapshot): void {
  if (localStorage.getItem(BACKUP_V1_STORAGE_KEY)) return;
  localStorage.setItem(
    BACKUP_V1_STORAGE_KEY,
    JSON.stringify({ ...snapshot, migratedAt: new Date().toISOString() })
  );
}

// Entry point: run once at startup, before any rendering. Idempotent — if v2
// data already exists, this is a no-op read. On failure, v1 data is left
// untouched and nothing is written, so the caller never renders an empty list.
export function migrate(): AppData {
  const existing = loadAppData();
  if (existing) return existing;

  let mapped: AppData | null = null;
  try {
    const snapshot = readV1Snapshot();
    mapped = mapV1ToV2(snapshot);
    backupV1Once(snapshot);
    saveAppData(mapped);
    return mapped;
  } catch (err) {
    console.error('[TimeMate] v1→v2 migration failed, v1 data left untouched:', err);
    // Return the best-effort in-memory mapping even if persisting it failed,
    // so a caller never renders an empty list off the back of a write error.
    return mapped ?? createDefaultAppData();
  }
}

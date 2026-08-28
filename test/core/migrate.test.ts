import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKUP_V1_STORAGE_KEY,
  mapV1ToV2,
  migrate,
  readV1Snapshot,
} from '../../src/core/migrate';
import { APP_DATA_STORAGE_KEY } from '../../src/core/model';
import v1Real from '../fixtures/v1-real.json';

// v1-real.json is a real v1 export pulled from DevTools -> Application ->
// Local Storage (per §10.5's "real v1 dataset" requirement) — sortMode and
// hourFormat were not captured from that profile, so they're filled with
// the same defaults ('newest'/'12') the empty-profile check returned.

const V1_TIMEZONES_KEY = 'timemate.timezones.v1';
const V1_PINNED_KEY = 'timemate.pinned.v1';
const V1_SORT_MODE_KEY = 'timemate.sort-mode.v1';
const V1_HOUR_FORMAT_KEY = 'timemate.hour-format.v1';

function seedV1Storage(fixture: typeof v1Real): void {
  localStorage.setItem(V1_TIMEZONES_KEY, JSON.stringify(fixture.timezones));
  localStorage.setItem(V1_PINNED_KEY, JSON.stringify(fixture.pinned));
  localStorage.setItem(V1_SORT_MODE_KEY, fixture.sortMode);
  localStorage.setItem(V1_HOUR_FORMAT_KEY, fixture.hourFormat);
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('readV1Snapshot', () => {
  it('returns empty/null defaults when nothing is stored', () => {
    expect(readV1Snapshot()).toEqual({
      timezones: [],
      pinnedIds: [],
      sortMode: null,
      hourFormat: null,
    });
  });

  it('parses a real v1 export and drops malformed entries', () => {
    seedV1Storage(v1Real);
    localStorage.setItem(V1_TIMEZONES_KEY, JSON.stringify([...v1Real.timezones, { id: 'bad' }]));

    const snapshot = readV1Snapshot();
    expect(snapshot.timezones).toHaveLength(v1Real.timezones.length);
    expect(snapshot.pinnedIds).toEqual(v1Real.pinned);
    expect(snapshot.sortMode).toBe('newest');
    expect(snapshot.hourFormat).toBe('12');
  });
});

describe('mapV1ToV2', () => {
  it('preserves entry count, order, and pinned status', () => {
    const snapshot = { ...v1Real, pinnedIds: v1Real.pinned } as unknown as Parameters<typeof mapV1ToV2>[0];
    const data = mapV1ToV2(snapshot);

    expect(data.entries).toHaveLength(v1Real.timezones.length);
    data.entries.forEach((entry, i) => {
      expect(entry.timezone).toBe(v1Real.timezones[i].zone);
      expect(entry.label).toBe(v1Real.timezones[i].city);
    });
    expect(data.entries.map((e) => e.pinned)).toEqual([true, false]);
  });

  it('maps sortMode and hourFormat into v2 settings', () => {
    const snapshot = { timezones: [], pinnedIds: [], sortMode: 'time' as const, hourFormat: '24' as const };
    const data = mapV1ToV2(snapshot);
    expect(data.settings.sortOrder).toBe('offset');
    expect(data.settings.hour24).toBe(true);
  });

  it('generates a fresh, unique id per entry, discarding the old v1 id', () => {
    const snapshot = { ...v1Real, pinnedIds: v1Real.pinned } as unknown as Parameters<typeof mapV1ToV2>[0];
    const data = mapV1ToV2(snapshot);
    const oldIds = new Set(v1Real.timezones.map((t) => t.id));
    data.entries.forEach((entry) => expect(oldIds.has(entry.id)).toBe(false));
  });
});

describe('migrate', () => {
  it('backs up v1 data and writes v2 data on first run', () => {
    seedV1Storage(v1Real);
    const data = migrate();

    expect(data.entries).toHaveLength(v1Real.timezones.length);
    expect(localStorage.getItem(BACKUP_V1_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(APP_DATA_STORAGE_KEY)).not.toBeNull();
    // v1 keys are left untouched
    expect(JSON.parse(localStorage.getItem(V1_TIMEZONES_KEY)!)).toEqual(v1Real.timezones);
  });

  it('is idempotent: re-running is a no-op that returns the same data', () => {
    seedV1Storage(v1Real);
    const first = migrate();
    const backupAfterFirst = localStorage.getItem(BACKUP_V1_STORAGE_KEY);

    const second = migrate();

    expect(second).toEqual(first);
    expect(localStorage.getItem(BACKUP_V1_STORAGE_KEY)).toBe(backupAfterFirst);
  });

  it('never produces an empty-list result when v1 has entries, even if the v2 write fails', () => {
    seedV1Storage(v1Real);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
      if (key === APP_DATA_STORAGE_KEY) {
        throw new Error('quota exceeded');
      }
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const data = migrate();

    expect(data.entries.length).toBeGreaterThan(0);
    expect(errorSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('produces an empty-but-valid AppData when there is no v1 data at all', () => {
    const data = migrate();
    expect(data).toEqual(expect.objectContaining({ version: 2, entries: [] }));
  });
});

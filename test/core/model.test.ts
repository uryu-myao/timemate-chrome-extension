import { beforeEach, describe, expect, it } from 'vitest';
import {
  createEntry,
  DEFAULT_SETTINGS,
  loadAppData,
  resolveWorkDays,
  resolveWorkHours,
  saveAppData,
} from '../../src/core/model';
import type { AppSettings } from '../../src/core/types';

beforeEach(() => {
  localStorage.clear();
});

describe('resolveWorkHours', () => {
  it('inherits the global default when workHours is null, flagged isDefault', () => {
    const entry = createEntry({ timezone: 'Asia/Tokyo' });
    const resolved = resolveWorkHours(entry, DEFAULT_SETTINGS);
    expect(resolved).toEqual({ ...DEFAULT_SETTINGS.defaultWorkHours, isDefault: true });
  });

  it('uses the entry own value when set, flagged not-default', () => {
    const entry = createEntry({ timezone: 'Asia/Tokyo', workHours: { start: 10, end: 16 } });
    const resolved = resolveWorkHours(entry, DEFAULT_SETTINGS);
    expect(resolved).toEqual({ start: 10, end: 16, isDefault: false });
  });
});

describe('resolveWorkDays', () => {
  it('inherits the global default when workDays is null', () => {
    const entry = createEntry({ timezone: 'Asia/Tokyo' });
    const resolved = resolveWorkDays(entry, DEFAULT_SETTINGS);
    expect(resolved).toEqual({ days: DEFAULT_SETTINGS.defaultWorkDays, isDefault: true });
  });

  it('treats an explicit empty array as a real, non-default value', () => {
    const entry = createEntry({ timezone: 'Asia/Tokyo', workDays: [] });
    const resolved = resolveWorkDays(entry, DEFAULT_SETTINGS);
    expect(resolved).toEqual({ days: [], isDefault: false });
  });
});

describe('createEntry', () => {
  it('fills schema defaults and generates a unique id', () => {
    const a = createEntry({ timezone: 'Europe/Berlin' });
    const b = createEntry({ timezone: 'Europe/Berlin' });
    expect(a.id).not.toEqual(b.id);
    expect(a.label).toBe('Europe/Berlin');
    expect(a.person).toBeNull();
    expect(a.workHours).toBeNull();
    expect(a.workDays).toBeNull();
    expect(a.includeInCoreTime).toBe(true);
    expect(a.pinned).toBe(false);
    expect(a.groups).toEqual([]);
  });
});

describe('loadAppData / saveAppData', () => {
  it('returns null when nothing is stored', () => {
    expect(loadAppData()).toBeNull();
  });

  it('returns null on corrupt JSON rather than throwing', () => {
    localStorage.setItem('timemate.data.v2', '{not json');
    expect(loadAppData()).toBeNull();
  });

  it('round-trips a saved AppData blob', () => {
    const settings: AppSettings = { ...DEFAULT_SETTINGS };
    const data = { version: 2 as const, entries: [createEntry({ timezone: 'Asia/Tokyo' })], groups: [], settings };
    saveAppData(data);
    expect(loadAppData()).toEqual(data);
  });
});

export interface WorkHours {
  start: number;
  end: number;
}

export type WorkDays = number[];

// Reserved for the next version — kept in the schema now to avoid a second migration.
export interface PersonInfo {
  name: string;
  initials: string;
  color: string;
  note: string;
}

// Reserved for the next version.
export interface Group {
  id: string;
  name: string;
}

export interface Entry {
  id: string;
  timezone: string;
  label: string;
  person: PersonInfo | null;
  workHours: WorkHours | null;
  workDays: WorkDays | null;
  includeInCoreTime: boolean;
  pinned: boolean;
  groups: string[];
  // Not part of spec-v2's schema — kept as an optional extension so the
  // existing sunrise/sunset-driven card gradient survives the v1→v2 cutover.
  lat?: number;
  lon?: number;
}

export type SortOrder = 'manual' | 'offset' | 'name';
export type CoreTimePanelMode = 'always' | 'collapsed' | 'hidden';

export interface AppSettings {
  hour24: boolean;
  showSeconds: boolean;
  sortOrder: SortOrder;
  referenceTimezone: string | null;
  defaultWorkHours: WorkHours;
  defaultWorkDays: WorkDays;
  coreTimePanel: CoreTimePanelMode;
  dstBannerEnabled: boolean;
  dstLeadDays: number;
  dstNotificationEnabled: boolean;
}

export interface AppData {
  version: 2;
  entries: Entry[];
  groups: Group[];
  settings: AppSettings;
}

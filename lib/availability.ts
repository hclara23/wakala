import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LeadRecord } from '@/lib/leads';
import type { ReservationRecord } from '@/lib/reservations';

const LOCAL_AVAILABILITY_DIR = path.join(process.cwd(), '.data', 'availability');
const LOCAL_AVAILABILITY_FILE = path.join(LOCAL_AVAILABILITY_DIR, 'settings.json');
const NETLIFY_STORE_NAME = 'availability-settings';
const NETLIFY_STORE_KEY = 'current';
const MAX_LOOKAHEAD_DAYS = 365;

export type AvailabilitySettings = {
  dumpster15ManualFloorDate: string;
  dumpster15DailyCapacity: number;
  dumpster15Note: string;
  quoteManualFloorDate: string;
  quoteDailyCapacity: number;
  quoteWeekdaysOnly: boolean;
  quoteNote: string;
  updatedAt: string;
};

type AvailabilitySettingsInput = {
  dumpster15ManualFloorDate: string;
  dumpster15DailyCapacity: number;
  dumpster15Note: string;
  quoteManualFloorDate: string;
  quoteDailyCapacity: number;
  quoteWeekdaysOnly: boolean;
  quoteNote: string;
};

export type AvailabilitySummary = {
  manualFloorDate: string;
  nextAvailableDate: string;
  dailyCapacity: number;
  bookedCountOnNextDate: number;
  remainingSlotsOnNextDate: number;
};

export type AvailabilitySnapshot = {
  settings: AvailabilitySettings;
  dumpster15: AvailabilitySummary;
  quote: AvailabilitySummary & {
    weekdaysOnly: boolean;
  };
};

function usesNetlifyBlobs() {
  return process.env.NETLIFY === 'true';
}

function getStorageMode() {
  return usesNetlifyBlobs() ? ('netlify' as const) : ('local' as const);
}

function nowIso() {
  return new Date().toISOString();
}

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function normalizeDate(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  }

  if (normalized < getTodayDateString()) {
    throw new Error(`${fieldName} cannot be earlier than today.`);
  }

  return normalized;
}

function normalizePositiveInteger(value: number, fieldName: string) {
  if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be a whole number greater than zero.`);
  }

  return value;
}

function normalizeOptionalText(value: string, fieldName: string, maxLength: number) {
  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }

  return normalized;
}

function normalizeStoredPositiveInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1
    ? Math.floor(value)
    : fallback;
}

function createDefaultAvailabilitySettings(): AvailabilitySettings {
  const today = getTodayDateString();

  return {
    dumpster15ManualFloorDate: today,
    dumpster15DailyCapacity: 1,
    dumpster15Note: '',
    quoteManualFloorDate: today,
    quoteDailyCapacity: 3,
    quoteWeekdaysOnly: true,
    quoteNote: '',
    updatedAt: nowIso(),
  };
}

function hydrateAvailabilitySettings(
  value: Partial<AvailabilitySettings> & {
    dumpster15NextAvailableDate?: string;
    quoteNextAvailableDate?: string;
  } | null | undefined
): AvailabilitySettings {
  const fallback = createDefaultAvailabilitySettings();

  return {
    dumpster15ManualFloorDate:
      typeof value?.dumpster15ManualFloorDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.dumpster15ManualFloorDate)
        ? value.dumpster15ManualFloorDate
        : typeof value?.dumpster15NextAvailableDate === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(value.dumpster15NextAvailableDate)
          ? value.dumpster15NextAvailableDate
          : fallback.dumpster15ManualFloorDate,
    dumpster15DailyCapacity: normalizeStoredPositiveInteger(
      value?.dumpster15DailyCapacity,
      fallback.dumpster15DailyCapacity
    ),
    dumpster15Note:
      typeof value?.dumpster15Note === 'string'
        ? value.dumpster15Note.trim()
        : fallback.dumpster15Note,
    quoteManualFloorDate:
      typeof value?.quoteManualFloorDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.quoteManualFloorDate)
        ? value.quoteManualFloorDate
        : typeof value?.quoteNextAvailableDate === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(value.quoteNextAvailableDate)
          ? value.quoteNextAvailableDate
          : fallback.quoteManualFloorDate,
    quoteDailyCapacity: normalizeStoredPositiveInteger(
      value?.quoteDailyCapacity,
      fallback.quoteDailyCapacity
    ),
    quoteWeekdaysOnly:
      typeof value?.quoteWeekdaysOnly === 'boolean'
        ? value.quoteWeekdaysOnly
        : fallback.quoteWeekdaysOnly,
    quoteNote: typeof value?.quoteNote === 'string' ? value.quoteNote.trim() : fallback.quoteNote,
    updatedAt:
      typeof value?.updatedAt === 'string' && value.updatedAt
        ? value.updatedAt
        : fallback.updatedAt,
  };
}

async function ensureLocalAvailabilityDir() {
  await mkdir(LOCAL_AVAILABILITY_DIR, { recursive: true });
}

async function readLocalAvailabilitySettings() {
  try {
    const content = await readFile(LOCAL_AVAILABILITY_FILE, 'utf8');
    return hydrateAvailabilitySettings(JSON.parse(content) as Partial<AvailabilitySettings>);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return createDefaultAvailabilitySettings();
    }

    throw error;
  }
}

async function writeLocalAvailabilitySettings(settings: AvailabilitySettings) {
  await ensureLocalAvailabilityDir();
  await writeFile(LOCAL_AVAILABILITY_FILE, JSON.stringify(settings, null, 2), 'utf8');
}

async function readStoredAvailabilitySettings() {
  if (getStorageMode() === 'netlify') {
    const entry = await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).get(NETLIFY_STORE_KEY, { type: 'json', consistency: 'strong' });

    return hydrateAvailabilitySettings(
      (entry as Partial<AvailabilitySettings> | null) || null
    );
  }

  return readLocalAvailabilitySettings();
}

async function writeStoredAvailabilitySettings(settings: AvailabilitySettings) {
  if (getStorageMode() === 'netlify') {
    await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).setJSON(NETLIFY_STORE_KEY, settings);
    return;
  }

  await writeLocalAvailabilitySettings(settings);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().split('T')[0];
}

function isWeekday(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day >= 1 && day <= 5;
}

function countScheduledDumpsterReservations(reservations: ReservationRecord[], date: string) {
  return reservations.filter(
    (reservation) =>
      reservation.itemId === 'dumpster_15_reservation' &&
      reservation.scheduledDate === date &&
      reservation.status !== 'canceled'
  ).length;
}

function countScheduledQuoteSlots(leads: LeadRecord[], date: string) {
  return leads.filter(
    (lead) =>
      lead.source === 'quote_request' &&
      lead.followUpStatus === 'scheduled' &&
      lead.followUpDate === date &&
      lead.pipelineStatus !== 'lost' &&
      lead.pipelineStatus !== 'completed'
  ).length;
}

type FindNextAvailableDateInput = {
  countBooked: (date: string) => number;
  dailyCapacity: number;
  startDate: string;
  weekdaysOnly?: boolean;
};

function findNextAvailableDate({
  countBooked,
  dailyCapacity,
  startDate,
  weekdaysOnly = false,
}: FindNextAvailableDateInput) {
  let candidate = startDate;

  for (let index = 0; index < MAX_LOOKAHEAD_DAYS; index += 1) {
    if (weekdaysOnly && !isWeekday(candidate)) {
      candidate = addDays(candidate, 1);
      continue;
    }

    const bookedCount = countBooked(candidate);

    if (bookedCount < dailyCapacity) {
      return {
        bookedCount,
        nextAvailableDate: candidate,
        remainingSlots: dailyCapacity - bookedCount,
      };
    }

    candidate = addDays(candidate, 1);
  }

  const bookedCount = countBooked(candidate);

  return {
    bookedCount,
    nextAvailableDate: candidate,
    remainingSlots: Math.max(dailyCapacity - bookedCount, 0),
  };
}

export function getEffectiveAvailableDate(value: string) {
  const today = getTodayDateString();
  return value > today ? value : today;
}

export function buildAvailabilitySnapshot({
  leads,
  reservations,
  settings,
}: {
  leads: LeadRecord[];
  reservations: ReservationRecord[];
  settings: AvailabilitySettings;
}): AvailabilitySnapshot {
  const dumpsterStartDate = getEffectiveAvailableDate(settings.dumpster15ManualFloorDate);
  const quoteStartDate = getEffectiveAvailableDate(settings.quoteManualFloorDate);

  const dumpster15 = findNextAvailableDate({
    countBooked: (date) => countScheduledDumpsterReservations(reservations, date),
    dailyCapacity: settings.dumpster15DailyCapacity,
    startDate: dumpsterStartDate,
  });
  const quote = findNextAvailableDate({
    countBooked: (date) => countScheduledQuoteSlots(leads, date),
    dailyCapacity: settings.quoteDailyCapacity,
    startDate: quoteStartDate,
    weekdaysOnly: settings.quoteWeekdaysOnly,
  });

  return {
    settings,
    dumpster15: {
      manualFloorDate: settings.dumpster15ManualFloorDate,
      nextAvailableDate: dumpster15.nextAvailableDate,
      dailyCapacity: settings.dumpster15DailyCapacity,
      bookedCountOnNextDate: dumpster15.bookedCount,
      remainingSlotsOnNextDate: dumpster15.remainingSlots,
    },
    quote: {
      manualFloorDate: settings.quoteManualFloorDate,
      nextAvailableDate: quote.nextAvailableDate,
      dailyCapacity: settings.quoteDailyCapacity,
      bookedCountOnNextDate: quote.bookedCount,
      remainingSlotsOnNextDate: quote.remainingSlots,
      weekdaysOnly: settings.quoteWeekdaysOnly,
    },
  };
}

export function getRequestedDumpsterDateAvailability({
  date,
  reservations,
  settings,
}: {
  date: string;
  reservations: ReservationRecord[];
  settings: AvailabilitySettings;
}) {
  const earliestBookableDate = getEffectiveAvailableDate(settings.dumpster15ManualFloorDate);

  if (date < earliestBookableDate) {
    const nextAvailable = findNextAvailableDate({
      countBooked: (candidate) => countScheduledDumpsterReservations(reservations, candidate),
      dailyCapacity: settings.dumpster15DailyCapacity,
      startDate: earliestBookableDate,
    });

    return {
      isAvailable: false,
      nextAvailableDate: nextAvailable.nextAvailableDate,
      reason: 'before_floor' as const,
    };
  }

  const bookedCount = countScheduledDumpsterReservations(reservations, date);

  if (bookedCount < settings.dumpster15DailyCapacity) {
    return {
      isAvailable: true,
      nextAvailableDate: date,
      reason: 'available' as const,
    };
  }

  const nextAvailable = findNextAvailableDate({
    countBooked: (candidate) => countScheduledDumpsterReservations(reservations, candidate),
    dailyCapacity: settings.dumpster15DailyCapacity,
    startDate: addDays(date, 1),
  });

  return {
    isAvailable: false,
    nextAvailableDate: nextAvailable.nextAvailableDate,
    reason: 'capacity_full' as const,
  };
}

export async function getAvailabilitySettings() {
  return readStoredAvailabilitySettings();
}

export async function updateAvailabilitySettings(input: AvailabilitySettingsInput) {
  const current = await getAvailabilitySettings();
  const nextSettings: AvailabilitySettings = {
    ...current,
    dumpster15ManualFloorDate: normalizeDate(
      input.dumpster15ManualFloorDate,
      'Dumpster manual floor date'
    ),
    dumpster15DailyCapacity: normalizePositiveInteger(
      input.dumpster15DailyCapacity,
      'Dumpster daily capacity'
    ),
    dumpster15Note: normalizeOptionalText(input.dumpster15Note, 'Dumpster availability note', 400),
    quoteManualFloorDate: normalizeDate(input.quoteManualFloorDate, 'Quote manual floor date'),
    quoteDailyCapacity: normalizePositiveInteger(
      input.quoteDailyCapacity,
      'Quote daily capacity'
    ),
    quoteWeekdaysOnly: Boolean(input.quoteWeekdaysOnly),
    quoteNote: normalizeOptionalText(input.quoteNote, 'Quote availability note', 400),
    updatedAt: nowIso(),
  };

  await writeStoredAvailabilitySettings(nextSettings);
  return nextSettings;
}

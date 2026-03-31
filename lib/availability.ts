import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const LOCAL_AVAILABILITY_DIR = path.join(process.cwd(), '.data', 'availability');
const LOCAL_AVAILABILITY_FILE = path.join(LOCAL_AVAILABILITY_DIR, 'settings.json');
const NETLIFY_STORE_NAME = 'availability-settings';
const NETLIFY_STORE_KEY = 'current';

export type AvailabilitySettings = {
  dumpster15NextAvailableDate: string;
  dumpster15Note: string;
  quoteNextAvailableDate: string;
  quoteNote: string;
  updatedAt: string;
};

type AvailabilitySettingsInput = {
  dumpster15NextAvailableDate: string;
  dumpster15Note: string;
  quoteNextAvailableDate: string;
  quoteNote: string;
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

function normalizeOptionalText(value: string, fieldName: string, maxLength: number) {
  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }

  return normalized;
}

function createDefaultAvailabilitySettings(): AvailabilitySettings {
  const today = getTodayDateString();

  return {
    dumpster15NextAvailableDate: today,
    dumpster15Note: '',
    quoteNextAvailableDate: today,
    quoteNote: '',
    updatedAt: nowIso(),
  };
}

function hydrateAvailabilitySettings(
  value: Partial<AvailabilitySettings> | null | undefined
): AvailabilitySettings {
  const fallback = createDefaultAvailabilitySettings();

  return {
    dumpster15NextAvailableDate:
      typeof value?.dumpster15NextAvailableDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.dumpster15NextAvailableDate)
        ? value.dumpster15NextAvailableDate
        : fallback.dumpster15NextAvailableDate,
    dumpster15Note:
      typeof value?.dumpster15Note === 'string' ? value.dumpster15Note.trim() : fallback.dumpster15Note,
    quoteNextAvailableDate:
      typeof value?.quoteNextAvailableDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.quoteNextAvailableDate)
        ? value.quoteNextAvailableDate
        : fallback.quoteNextAvailableDate,
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

    return hydrateAvailabilitySettings((entry as Partial<AvailabilitySettings> | null) || null);
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

export function getEffectiveAvailableDate(value: string) {
  const today = getTodayDateString();
  return value > today ? value : today;
}

export async function getAvailabilitySettings() {
  return readStoredAvailabilitySettings();
}

export async function updateAvailabilitySettings(input: AvailabilitySettingsInput) {
  const current = await getAvailabilitySettings();
  const nextSettings: AvailabilitySettings = {
    ...current,
    dumpster15NextAvailableDate: normalizeDate(
      input.dumpster15NextAvailableDate,
      'Dumpster next available date'
    ),
    dumpster15Note: normalizeOptionalText(input.dumpster15Note, 'Dumpster availability note', 400),
    quoteNextAvailableDate: normalizeDate(
      input.quoteNextAvailableDate,
      'Quote next available date'
    ),
    quoteNote: normalizeOptionalText(input.quoteNote, 'Quote availability note', 400),
    updatedAt: nowIso(),
  };

  await writeStoredAvailabilitySettings(nextSettings);
  return nextSettings;
}

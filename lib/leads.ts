import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeLeadAttribution, type LeadAttributionInput } from '@/lib/lead-attribution';

const LOCAL_LEAD_DIR = path.join(process.cwd(), '.data', 'leads');
const NETLIFY_STORE_NAME = 'leads';

export const leadSourceTypes = ['quote_request', 'reservation'] as const;
export const leadPipelineStatuses = [
  'new',
  'contacted',
  'quoted',
  'won',
  'scheduled',
  'completed',
  'lost',
] as const;
export const leadFollowUpStatuses = ['none', 'scheduled', 'completed'] as const;
export const leadQuoteStatuses = ['not_started', 'draft', 'sent', 'accepted', 'declined'] as const;
export const leadReviewStatuses = ['not_requested', 'requested', 'received'] as const;

export type LeadSourceType = (typeof leadSourceTypes)[number];
export type LeadPipelineStatus = (typeof leadPipelineStatuses)[number];
export type LeadFollowUpStatus = (typeof leadFollowUpStatuses)[number];
export type LeadQuoteStatus = (typeof leadQuoteStatuses)[number];
export type LeadReviewStatus = (typeof leadReviewStatuses)[number];

export type LeadFilters = {
  pipelineStatus?: LeadPipelineStatus | 'all';
  query?: string;
  source?: LeadSourceType | 'all';
};

export type LeadRecord = {
  id: string;
  source: LeadSourceType;
  sourceLabel: string;
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  serviceAddress: string;
  details: string;
  pipelineStatus: LeadPipelineStatus;
  reservationId: string | null;
  reservationStatus: string | null;
  paymentStatus: string | null;
  amountTotal: number | null;
  pageUrl: string;
  landingPage: string;
  referrer: string;
  referrerHost: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  followUpStatus: LeadFollowUpStatus;
  followUpDate: string;
  followUpCompletedAt: string | null;
  quoteStatus: LeadQuoteStatus;
  quoteAmount: number | null;
  quoteSummary: string;
  quoteSentAt: string | null;
  quoteAcceptedAt: string | null;
  reviewStatus: LeadReviewStatus;
  reviewRequestedAt: string | null;
  reviewReceivedAt: string | null;
  jobCreatedAt: string | null;
  jobScheduledDate: string;
  jobScheduledWindow: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

type CreateContactLeadInput = {
  attribution?: LeadAttributionInput | null;
  customerName: string;
  details: string;
  email: string;
  phone: string;
  serviceAddress?: string;
  serviceType: string;
};

type ReservationLeadInput = {
  attribution?: LeadAttributionInput | null;
  amountTotal: number | null;
  customerName: string;
  details: string;
  email: string;
  itemName: string;
  paymentStatus: string | null;
  phone: string;
  preferredDate: string;
  reservationId: string;
  reservationStatus: string | null;
  scheduledDate: string;
  serviceAddress: string;
};

type AdminLeadUpdate = {
  adminNotes: string;
  followUpDate: string;
  followUpStatus: LeadFollowUpStatus;
  pipelineStatus: LeadPipelineStatus;
  quoteAmount: string | number | null;
  quoteStatus: LeadQuoteStatus;
  quoteSummary: string;
  reviewStatus: LeadReviewStatus;
  jobScheduledDate: string;
  jobScheduledWindow: string;
};

const autoPipelineStatuses = new Set<LeadPipelineStatus>([
  'new',
  'contacted',
  'quoted',
  'won',
  'scheduled',
]);

const leadPipelineStatusLabels: Record<LeadPipelineStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  scheduled: 'Scheduled',
  completed: 'Completed',
  lost: 'Lost',
};

const leadSourceLabels: Record<LeadSourceType, string> = {
  quote_request: 'Quote request',
  reservation: 'Online reservation',
};
const leadFollowUpStatusLabels: Record<LeadFollowUpStatus, string> = {
  none: 'No reminder',
  scheduled: 'Reminder scheduled',
  completed: 'Reminder completed',
};
const leadQuoteStatusLabels: Record<LeadQuoteStatus, string> = {
  not_started: 'No quote',
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
};
const leadReviewStatusLabels: Record<LeadReviewStatus, string> = {
  not_requested: 'Not requested',
  requested: 'Requested',
  received: 'Received',
};

function usesNetlifyBlobs() {
  return process.env.NETLIFY === 'true';
}

function getLeadStorageMode() {
  if (usesNetlifyBlobs()) {
    return 'netlify' as const;
  }

  return 'local' as const;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeLeadId(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!/^lead_[a-f0-9]{12}$/.test(normalized)) {
    throw new Error('Lead reference is invalid.');
  }

  return normalized;
}

function normalizeReservationId(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!/^res_[a-f0-9]{12}$/.test(normalized)) {
    throw new Error('Reservation reference is invalid.');
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number) {
  return (value || '').trim().slice(0, maxLength);
}

function normalizeOptionalDate(value: string | null | undefined) {
  const normalized = (value || '').trim();

  if (!normalized) {
    return '';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error('Dates must use YYYY-MM-DD format.');
  }

  return normalized;
}

function normalizeCurrencyInput(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  const normalized = (value || '').toString().trim();

  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Quote amount must be a valid dollar amount.');
  }

  return Math.round(Number(normalized) * 100);
}

function asLeadFollowUpStatus(value: string | undefined): LeadFollowUpStatus {
  return leadFollowUpStatuses.includes(value as LeadFollowUpStatus)
    ? (value as LeadFollowUpStatus)
    : 'none';
}

function asLeadQuoteStatus(value: string | undefined): LeadQuoteStatus {
  return leadQuoteStatuses.includes(value as LeadQuoteStatus)
    ? (value as LeadQuoteStatus)
    : 'not_started';
}

function asLeadReviewStatus(value: string | undefined): LeadReviewStatus {
  return leadReviewStatuses.includes(value as LeadReviewStatus)
    ? (value as LeadReviewStatus)
    : 'not_requested';
}

function hydrateLeadRecord(lead: LeadRecord) {
  return {
    ...lead,
    followUpStatus: asLeadFollowUpStatus((lead as Partial<LeadRecord>).followUpStatus),
    followUpDate: normalizeOptionalDate((lead as Partial<LeadRecord>).followUpDate),
    followUpCompletedAt: (lead as Partial<LeadRecord>).followUpCompletedAt || null,
    quoteStatus: asLeadQuoteStatus((lead as Partial<LeadRecord>).quoteStatus),
    quoteAmount:
      typeof (lead as Partial<LeadRecord>).quoteAmount === 'number'
        ? (lead as Partial<LeadRecord>).quoteAmount || null
        : null,
    quoteSummary: normalizeOptionalText((lead as Partial<LeadRecord>).quoteSummary, 2400),
    quoteSentAt: (lead as Partial<LeadRecord>).quoteSentAt || null,
    quoteAcceptedAt: (lead as Partial<LeadRecord>).quoteAcceptedAt || null,
    reviewStatus: asLeadReviewStatus((lead as Partial<LeadRecord>).reviewStatus),
    reviewRequestedAt: (lead as Partial<LeadRecord>).reviewRequestedAt || null,
    reviewReceivedAt: (lead as Partial<LeadRecord>).reviewReceivedAt || null,
    jobCreatedAt: (lead as Partial<LeadRecord>).jobCreatedAt || null,
    jobScheduledDate: normalizeOptionalDate((lead as Partial<LeadRecord>).jobScheduledDate),
    jobScheduledWindow: normalizeOptionalText(
      (lead as Partial<LeadRecord>).jobScheduledWindow,
      120
    ),
  };
}

function createLeadId() {
  return `lead_${randomBytes(6).toString('hex')}`;
}

function createLeadIdFromReservation(reservationId: string) {
  return `lead_${normalizeReservationId(reservationId).slice(4)}`;
}

function buildLeadFilePath(id: string) {
  return path.join(LOCAL_LEAD_DIR, `${normalizeLeadId(id)}.json`);
}

async function ensureLocalLeadDir() {
  await mkdir(LOCAL_LEAD_DIR, { recursive: true });
}

async function readLocalLead(id: string) {
  try {
    const content = await readFile(buildLeadFilePath(id), 'utf8');
    return hydrateLeadRecord(JSON.parse(content) as LeadRecord);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }

    throw error;
  }
}

async function writeLocalLead(lead: LeadRecord) {
  await ensureLocalLeadDir();
  await writeFile(buildLeadFilePath(lead.id), JSON.stringify(lead, null, 2), 'utf8');
}

async function listLocalLeads() {
  try {
    await ensureLocalLeadDir();
    const fileNames = await readdir(LOCAL_LEAD_DIR);
    const leads = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.json'))
        .map(async (fileName) => {
          const content = await readFile(path.join(LOCAL_LEAD_DIR, fileName), 'utf8');
          return hydrateLeadRecord(JSON.parse(content) as LeadRecord);
        })
    );

    return leads;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return [];
    }

    throw error;
  }
}

async function readLead(id: string) {
  const normalizedId = normalizeLeadId(id);
  const storageMode = getLeadStorageMode();

  if (storageMode === 'netlify') {
    const entry = (await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).get(normalizedId, { type: 'json', consistency: 'strong' })) as LeadRecord | null;

    return entry ? hydrateLeadRecord(entry) : null;
  }

  return readLocalLead(normalizedId);
}

async function writeLead(lead: LeadRecord) {
  const storageMode = getLeadStorageMode();

  if (storageMode === 'netlify') {
    await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).setJSON(lead.id, lead);
    return;
  }

  await writeLocalLead(lead);
}

async function listStoredLeads() {
  const storageMode = getLeadStorageMode();

  if (storageMode === 'netlify') {
    const store = getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    });
    const { blobs } = await store.list();
    const leads = await Promise.all(
      blobs.map(async ({ key }) => {
        const entry = await store.get(key, { type: 'json', consistency: 'strong' });
        return entry ? hydrateLeadRecord(entry as LeadRecord) : null;
      })
    );

    return leads.filter((lead): lead is LeadRecord => lead !== null);
  }

  return listLocalLeads();
}

function mergeAttributionValue(existing: string, next: string) {
  return existing || next;
}

function buildReservationLeadDetails(preferredDate: string, details: string) {
  const lines = [];

  if (preferredDate) {
    lines.push(`Preferred date: ${preferredDate}`);
  }

  if (details) {
    lines.push(`Notes: ${details}`);
  }

  return lines.join('\n').trim();
}

function resolveReservationPipelineStatus(
  currentStatus: LeadPipelineStatus | undefined,
  reservationStatus: string | null,
  paymentStatus: string | null,
  scheduledDate: string
) {
  if (currentStatus && !autoPipelineStatuses.has(currentStatus)) {
    return currentStatus;
  }

  if (reservationStatus === 'canceled') {
    return 'lost';
  }

  if (reservationStatus === 'confirmed') {
    return scheduledDate ? 'scheduled' : 'won';
  }

  if (paymentStatus === 'paid') {
    return 'won';
  }

  return currentStatus || 'new';
}

export function getLeadPipelineStatusLabel(status: LeadPipelineStatus) {
  return leadPipelineStatusLabels[status];
}

export function getLeadSourceLabel(source: LeadSourceType) {
  return leadSourceLabels[source];
}

export function getLeadFollowUpStatusLabel(status: LeadFollowUpStatus) {
  return leadFollowUpStatusLabels[status];
}

export function getLeadQuoteStatusLabel(status: LeadQuoteStatus) {
  return leadQuoteStatusLabels[status];
}

export function getLeadReviewStatusLabel(status: LeadReviewStatus) {
  return leadReviewStatusLabels[status];
}

export function formatLeadReference(leadId: string) {
  return normalizeLeadId(leadId).toUpperCase();
}

export function isLeadFollowUpDue(lead: LeadRecord) {
  if (lead.followUpStatus !== 'scheduled' || !lead.followUpDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${lead.followUpDate}T00:00:00`) <= today;
}

export function filterLeads(leads: LeadRecord[], filters: LeadFilters) {
  const normalizedQuery = (filters.query || '').trim().toLowerCase();

  return leads.filter((lead) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        lead.id,
        lead.customerName,
        lead.email,
        lead.phone,
        lead.serviceType,
        lead.serviceAddress,
        lead.details,
        lead.quoteSummary,
        lead.jobScheduledWindow,
        lead.followUpDate,
        lead.reservationId,
        lead.utmSource,
        lead.utmCampaign,
        lead.referrerHost,
      ].some((value) => (value || '').toLowerCase().includes(normalizedQuery));
    const matchesPipeline =
      !filters.pipelineStatus ||
      filters.pipelineStatus === 'all' ||
      lead.pipelineStatus === filters.pipelineStatus;
    const matchesSource =
      !filters.source || filters.source === 'all' || lead.source === filters.source;

    return matchesQuery && matchesPipeline && matchesSource;
  });
}

export function filterLeadsByAge(leads: LeadRecord[], days: number) {
  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  threshold.setDate(threshold.getDate() - days);

  return leads.filter((lead) => new Date(lead.createdAt) >= threshold);
}

export async function createContactLead(input: CreateContactLeadInput) {
  const attribution = normalizeLeadAttribution(input.attribution);
  const timestamp = nowIso();
  const lead: LeadRecord = {
    id: createLeadId(),
    source: 'quote_request',
    sourceLabel: leadSourceLabels.quote_request,
    serviceType: normalizeOptionalText(input.serviceType, 120) || 'General',
    customerName: normalizeOptionalText(input.customerName, 120),
    email: normalizeOptionalText(input.email.toLowerCase(), 120),
    phone: normalizeOptionalText(input.phone, 24),
    serviceAddress: normalizeOptionalText(input.serviceAddress, 160),
    details: normalizeOptionalText(input.details, 2400),
    pipelineStatus: 'new',
    reservationId: null,
    reservationStatus: null,
    paymentStatus: null,
    amountTotal: null,
    pageUrl: attribution.pageUrl,
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    referrerHost: attribution.referrerHost,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmTerm: attribution.utmTerm,
    utmContent: attribution.utmContent,
    followUpStatus: 'none',
    followUpDate: '',
    followUpCompletedAt: null,
    quoteStatus: 'not_started',
    quoteAmount: null,
    quoteSummary: '',
    quoteSentAt: null,
    quoteAcceptedAt: null,
    reviewStatus: 'not_requested',
    reviewRequestedAt: null,
    reviewReceivedAt: null,
    jobCreatedAt: null,
    jobScheduledDate: '',
    jobScheduledWindow: '',
    adminNotes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeLead(lead);

  return lead;
}

export async function upsertLeadFromReservation(input: ReservationLeadInput) {
  const leadId = createLeadIdFromReservation(input.reservationId);
  const existing = await readLead(leadId);
  const attribution = normalizeLeadAttribution(input.attribution);
  const timestamp = nowIso();
  const nextStatus = resolveReservationPipelineStatus(
    existing?.pipelineStatus,
    input.reservationStatus,
    input.paymentStatus,
    input.scheduledDate
  );

  const lead: LeadRecord = {
    id: leadId,
    source: 'reservation',
    sourceLabel: leadSourceLabels.reservation,
    serviceType: normalizeOptionalText(input.itemName, 160),
    customerName: normalizeOptionalText(input.customerName, 120),
    email: normalizeOptionalText(input.email.toLowerCase(), 120),
    phone: normalizeOptionalText(input.phone, 24),
    serviceAddress: normalizeOptionalText(input.serviceAddress, 160),
    details: buildReservationLeadDetails(input.preferredDate, input.details),
    pipelineStatus: nextStatus,
    reservationId: normalizeReservationId(input.reservationId),
    reservationStatus: normalizeOptionalText(input.reservationStatus, 40) || null,
    paymentStatus: normalizeOptionalText(input.paymentStatus, 40) || null,
    amountTotal: typeof input.amountTotal === 'number' ? input.amountTotal : null,
    pageUrl: mergeAttributionValue(existing?.pageUrl || '', attribution.pageUrl),
    landingPage: mergeAttributionValue(existing?.landingPage || '', attribution.landingPage),
    referrer: mergeAttributionValue(existing?.referrer || '', attribution.referrer),
    referrerHost: mergeAttributionValue(existing?.referrerHost || '', attribution.referrerHost),
    utmSource: mergeAttributionValue(existing?.utmSource || '', attribution.utmSource),
    utmMedium: mergeAttributionValue(existing?.utmMedium || '', attribution.utmMedium),
    utmCampaign: mergeAttributionValue(existing?.utmCampaign || '', attribution.utmCampaign),
    utmTerm: mergeAttributionValue(existing?.utmTerm || '', attribution.utmTerm),
    utmContent: mergeAttributionValue(existing?.utmContent || '', attribution.utmContent),
    followUpStatus: existing?.followUpStatus || 'none',
    followUpDate: existing?.followUpDate || '',
    followUpCompletedAt: existing?.followUpCompletedAt || null,
    quoteStatus: existing?.quoteStatus || 'not_started',
    quoteAmount: existing?.quoteAmount || null,
    quoteSummary: existing?.quoteSummary || '',
    quoteSentAt: existing?.quoteSentAt || null,
    quoteAcceptedAt: existing?.quoteAcceptedAt || null,
    reviewStatus: existing?.reviewStatus || 'not_requested',
    reviewRequestedAt: existing?.reviewRequestedAt || null,
    reviewReceivedAt: existing?.reviewReceivedAt || null,
    jobCreatedAt: existing?.jobCreatedAt || null,
    jobScheduledDate: existing?.jobScheduledDate || input.scheduledDate || '',
    jobScheduledWindow: existing?.jobScheduledWindow || '',
    adminNotes: existing?.adminNotes || '',
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  await writeLead(lead);

  return lead;
}

export async function getLead(leadId: string) {
  try {
    return await readLead(leadId);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Lead reference is invalid.') {
      return null;
    }

    throw error;
  }
}

export async function listLeads() {
  const leads = await listStoredLeads();
  return leads.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function convertLeadToJob(
  leadId: string,
  update: AdminLeadUpdate
) {
  const lead = await readLead(leadId);

  if (!lead) {
    throw new Error('Lead not found.');
  }

  const quoteAmount = normalizeCurrencyInput(update.quoteAmount);
  const quoteSummary = normalizeOptionalText(update.quoteSummary, 2400);
  const adminNotes = normalizeOptionalText(update.adminNotes, 1200);
  const followUpStatus = update.followUpStatus;
  const followUpDate = normalizeOptionalDate(update.followUpDate);
  const reviewStatus = update.reviewStatus;
  const jobScheduledDate = normalizeOptionalDate(update.jobScheduledDate);
  const jobScheduledWindow = normalizeOptionalText(update.jobScheduledWindow, 120);

  if (followUpStatus === 'scheduled' && !followUpDate) {
    throw new Error('Set a follow-up date before scheduling a reminder.');
  }

  if (quoteAmount === null || quoteAmount <= 0) {
    throw new Error('Enter a quote amount before converting this lead to a job.');
  }

  if (!quoteSummary) {
    throw new Error('Add a quote summary before converting this lead to a job.');
  }

  const timestamp = nowIso();
  const nextLead: LeadRecord = {
    ...lead,
    pipelineStatus: jobScheduledDate ? 'scheduled' : 'won',
    followUpStatus,
    followUpDate,
    followUpCompletedAt:
      followUpStatus === 'completed' ? lead.followUpCompletedAt || timestamp : lead.followUpCompletedAt,
    quoteStatus: 'accepted',
    quoteAmount,
    quoteSummary,
    quoteSentAt: lead.quoteSentAt || timestamp,
    quoteAcceptedAt: lead.quoteAcceptedAt || timestamp,
    reviewStatus,
    reviewRequestedAt:
      reviewStatus === 'requested' || reviewStatus === 'received'
        ? lead.reviewRequestedAt || timestamp
        : lead.reviewRequestedAt,
    reviewReceivedAt:
      reviewStatus === 'received' ? lead.reviewReceivedAt || timestamp : lead.reviewReceivedAt,
    jobCreatedAt: lead.jobCreatedAt || timestamp,
    jobScheduledDate,
    jobScheduledWindow,
    adminNotes,
    updatedAt: timestamp,
  };

  await writeLead(nextLead);

  return nextLead;
}

export async function updateLeadByAdmin(leadId: string, update: AdminLeadUpdate) {
  const lead = await readLead(leadId);

  if (!lead) {
    throw new Error('Lead not found.');
  }

  if (!leadPipelineStatuses.includes(update.pipelineStatus)) {
    throw new Error('Lead status is invalid.');
  }

  if (!leadFollowUpStatuses.includes(update.followUpStatus)) {
    throw new Error('Follow-up status is invalid.');
  }

  if (!leadQuoteStatuses.includes(update.quoteStatus)) {
    throw new Error('Quote status is invalid.');
  }

  if (!leadReviewStatuses.includes(update.reviewStatus)) {
    throw new Error('Review status is invalid.');
  }

  const followUpDate = normalizeOptionalDate(update.followUpDate);
  const quoteAmount = normalizeCurrencyInput(update.quoteAmount);
  const quoteSummary = normalizeOptionalText(update.quoteSummary, 2400);
  const reviewStatus = update.reviewStatus;
  const followUpStatus = update.followUpStatus;
  const quoteStatus = update.quoteStatus;
  const adminNotes = normalizeOptionalText(update.adminNotes, 1200);
  const jobScheduledDate = normalizeOptionalDate(update.jobScheduledDate);
  const jobScheduledWindow = normalizeOptionalText(update.jobScheduledWindow, 120);
  const timestamp = nowIso();

  if (followUpStatus === 'scheduled' && !followUpDate) {
    throw new Error('Set a follow-up date before scheduling a reminder.');
  }

  const nextPipelineStatus =
    quoteStatus === 'accepted' &&
    ['new', 'contacted', 'quoted'].includes(update.pipelineStatus)
      ? ('won' as LeadPipelineStatus)
      : update.pipelineStatus;

  const nextLead: LeadRecord = {
    ...lead,
    pipelineStatus: nextPipelineStatus,
    followUpStatus,
    followUpDate,
    followUpCompletedAt:
      followUpStatus === 'completed' ? lead.followUpCompletedAt || timestamp : lead.followUpCompletedAt,
    quoteStatus,
    quoteAmount,
    quoteSummary,
    quoteSentAt:
      quoteStatus === 'sent' || quoteStatus === 'accepted'
        ? lead.quoteSentAt || timestamp
        : lead.quoteSentAt,
    quoteAcceptedAt:
      quoteStatus === 'accepted' ? lead.quoteAcceptedAt || timestamp : lead.quoteAcceptedAt,
    reviewStatus,
    reviewRequestedAt:
      reviewStatus === 'requested' || reviewStatus === 'received'
        ? lead.reviewRequestedAt || timestamp
        : lead.reviewRequestedAt,
    reviewReceivedAt:
      reviewStatus === 'received' ? lead.reviewReceivedAt || timestamp : lead.reviewReceivedAt,
    jobScheduledDate,
    jobScheduledWindow,
    adminNotes,
    updatedAt: timestamp,
  };

  await writeLead(nextLead);

  return nextLead;
}

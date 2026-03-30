import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type Stripe from 'stripe';
import type { LeadAttributionInput } from '@/lib/lead-attribution';
import { upsertLeadFromReservation } from '@/lib/leads';
import { checkoutItems, type CheckoutItemId } from '@/lib/site-data';

const LOCAL_RESERVATION_DIR = path.join(process.cwd(), '.data', 'reservations');
const NETLIFY_STORE_NAME = 'reservations';

export const reservationStatuses = [
  'payment_pending',
  'pending_review',
  'confirmed',
  'needs_attention',
  'canceled',
] as const;

export const reservationPaymentStatuses = ['unpaid', 'paid', 'failed'] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];
export type ReservationPaymentStatus = (typeof reservationPaymentStatuses)[number];

export type ReservationFilters = {
  query?: string;
  status?: ReservationStatus | 'all';
  paymentStatus?: ReservationPaymentStatus | 'all';
};

export type ReservationRecord = {
  id: string;
  itemId: CheckoutItemId;
  itemName: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  serviceAddress: string;
  preferredDate: string;
  notes: string;
  status: ReservationStatus;
  paymentStatus: ReservationPaymentStatus;
  checkoutSessionId: string | null;
  stripeCustomerId: string | null;
  amountTotal: number | null;
  currency: string | null;
  scheduledDate: string;
  scheduledWindow: string;
  adminNotes: string;
  confirmedAt: string | null;
  paidAt: string | null;
  lastPaymentEvent: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateReservationInput = {
  attribution?: LeadAttributionInput | null;
  itemId: CheckoutItemId;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  serviceAddress: string;
  preferredDate: string;
  notes: string;
};

type AdminReservationUpdate = {
  status: ReservationStatus;
  scheduledDate: string;
  scheduledWindow: string;
  adminNotes: string;
};

function buildLeadSyncPayload(
  reservation: ReservationRecord,
  attribution?: LeadAttributionInput | null
) {
  return {
    attribution,
    amountTotal: reservation.amountTotal,
    customerName: reservation.customerName,
    details: reservation.notes,
    email: reservation.email,
    itemName: reservation.itemName,
    paymentStatus: reservation.paymentStatus,
    phone: reservation.phone,
    preferredDate: reservation.preferredDate,
    reservationId: reservation.id,
    reservationStatus: reservation.status,
    scheduledDate: reservation.scheduledDate,
    serviceAddress: reservation.serviceAddress,
  };
}

const reservationStatusLabels: Record<ReservationStatus, string> = {
  payment_pending: 'Awaiting payment',
  pending_review: 'Pending schedule review',
  confirmed: 'Confirmed',
  needs_attention: 'Needs attention',
  canceled: 'Canceled',
};

const reservationPaymentStatusLabels: Record<ReservationPaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Payment failed',
};

function usesNetlifyBlobs() {
  return process.env.NETLIFY === 'true';
}

function getReservationStorageMode() {
  if (usesNetlifyBlobs()) {
    return 'netlify' as const;
  }

  return 'local' as const;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeReservationId(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!/^res_[a-f0-9]{12}$/.test(normalized)) {
    throw new Error('Reservation reference is invalid.');
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number) {
  const normalized = (value || '').trim();

  if (normalized.length > maxLength) {
    throw new Error('Reservation field is too long.');
  }

  return normalized;
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

function buildReservationFilePath(id: string) {
  return path.join(LOCAL_RESERVATION_DIR, `${normalizeReservationId(id)}.json`);
}

async function ensureLocalReservationDir() {
  await mkdir(LOCAL_RESERVATION_DIR, { recursive: true });
}

async function readLocalReservation(id: string) {
  try {
    const content = await readFile(buildReservationFilePath(id), 'utf8');
    return JSON.parse(content) as ReservationRecord;
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

async function writeLocalReservation(reservation: ReservationRecord) {
  await ensureLocalReservationDir();
  await writeFile(
    buildReservationFilePath(reservation.id),
    JSON.stringify(reservation, null, 2),
    'utf8'
  );
}

async function listLocalReservations() {
  try {
    await ensureLocalReservationDir();
    const fileNames = await readdir(LOCAL_RESERVATION_DIR);
    const reservations = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.json'))
        .map(async (fileName) => {
          const content = await readFile(path.join(LOCAL_RESERVATION_DIR, fileName), 'utf8');
          return JSON.parse(content) as ReservationRecord;
        })
    );

    return reservations;
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

async function readReservation(id: string) {
  const normalizedId = normalizeReservationId(id);
  const storageMode = getReservationStorageMode();

  if (storageMode === 'netlify') {
    return (await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).get(normalizedId, { type: 'json', consistency: 'strong' })) as ReservationRecord | null;
  }

  return readLocalReservation(normalizedId);
}

async function writeReservation(reservation: ReservationRecord) {
  const storageMode = getReservationStorageMode();

  if (storageMode === 'netlify') {
    await getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    }).setJSON(reservation.id, reservation);
    return;
  }

  await writeLocalReservation(reservation);
}

async function listStoredReservations() {
  const storageMode = getReservationStorageMode();

  if (storageMode === 'netlify') {
    const store = getStore({
      name: NETLIFY_STORE_NAME,
      consistency: 'strong',
    });
    const { blobs } = await store.list();
    const reservations = await Promise.all(
      blobs.map(async ({ key }) => {
        const entry = await store.get(key, { type: 'json', consistency: 'strong' });
        return entry as ReservationRecord | null;
      })
    );

    return reservations.filter((reservation): reservation is ReservationRecord => reservation !== null);
  }

  return listLocalReservations();
}

function createReservationId() {
  return `res_${randomBytes(6).toString('hex')}`;
}

function getReservationFromSessionMetadata(
  session: Stripe.Checkout.Session
): Omit<ReservationRecord, 'createdAt' | 'updatedAt'> | null {
  const metadata = session.metadata ?? {};
  const reservationId =
    typeof metadata.reservationId === 'string' ? metadata.reservationId.trim().toLowerCase() : '';
  const itemId =
    typeof metadata.itemId === 'string' && metadata.itemId in checkoutItems
      ? (metadata.itemId as CheckoutItemId)
      : null;

  if (!reservationId || !itemId) {
    return null;
  }

  return {
    id: normalizeReservationId(reservationId),
    itemId,
    itemName: checkoutItems[itemId].name,
    customerName: typeof metadata.customerName === 'string' ? metadata.customerName : '',
    email:
      session.customer_details?.email ||
      (typeof metadata.email === 'string' ? metadata.email : ''),
    phone: typeof metadata.phone === 'string' ? metadata.phone : '',
    addressLine1: typeof metadata.addressLine1 === 'string' ? metadata.addressLine1 : '',
    city: typeof metadata.city === 'string' ? metadata.city : '',
    state: typeof metadata.state === 'string' ? metadata.state : '',
    postalCode: typeof metadata.postalCode === 'string' ? metadata.postalCode : '',
    serviceAddress: typeof metadata.serviceAddress === 'string' ? metadata.serviceAddress : '',
    preferredDate: typeof metadata.preferredDate === 'string' ? metadata.preferredDate : '',
    notes: typeof metadata.notes === 'string' ? metadata.notes : '',
    status: 'payment_pending',
    paymentStatus: 'unpaid',
    checkoutSessionId: session.id,
    stripeCustomerId:
      typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    scheduledDate: '',
    scheduledWindow: '',
    adminNotes: '',
    confirmedAt: null,
    paidAt: null,
    lastPaymentEvent: null,
  };
}

function resolvePaymentStatus(
  session: Stripe.Checkout.Session,
  eventType?: string
): ReservationPaymentStatus {
  if (eventType === 'checkout.session.async_payment_failed') {
    return 'failed';
  }

  if (session.payment_status === 'paid') {
    return 'paid';
  }

  return 'unpaid';
}

function resolveReservationStatus(
  currentStatus: ReservationStatus,
  paymentStatus: ReservationPaymentStatus
): ReservationStatus {
  if (currentStatus === 'confirmed' || currentStatus === 'canceled') {
    return currentStatus;
  }

  if (paymentStatus === 'paid') {
    return 'pending_review';
  }

  if (paymentStatus === 'failed') {
    return 'needs_attention';
  }

  return 'payment_pending';
}

export function getReservationStatusLabel(status: ReservationStatus) {
  return reservationStatusLabels[status];
}

export function getReservationPaymentStatusLabel(status: ReservationPaymentStatus) {
  return reservationPaymentStatusLabels[status];
}

export function formatReservationReference(reservationId: string) {
  return normalizeReservationId(reservationId).toUpperCase();
}

export function filterReservations(
  reservations: ReservationRecord[],
  filters: ReservationFilters
) {
  const normalizedQuery = (filters.query || '').trim().toLowerCase();

  return reservations.filter((reservation) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        reservation.id,
        reservation.customerName,
        reservation.email,
        reservation.phone,
        reservation.serviceAddress,
        reservation.notes,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesStatus =
      !filters.status || filters.status === 'all' || reservation.status === filters.status;
    const matchesPayment =
      !filters.paymentStatus ||
      filters.paymentStatus === 'all' ||
      reservation.paymentStatus === filters.paymentStatus;

    return matchesQuery && matchesStatus && matchesPayment;
  });
}

export async function createReservationDraft(input: CreateReservationInput) {
  const item = checkoutItems[input.itemId];
  const timestamp = nowIso();
  const reservation: ReservationRecord = {
    id: createReservationId(),
    itemId: input.itemId,
    itemName: item.name,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    addressLine1: input.addressLine1,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    serviceAddress: input.serviceAddress,
    preferredDate: input.preferredDate,
    notes: input.notes,
    status: 'payment_pending',
    paymentStatus: 'unpaid',
    checkoutSessionId: null,
    stripeCustomerId: null,
    amountTotal: null,
    currency: 'usd',
    scheduledDate: '',
    scheduledWindow: '',
    adminNotes: '',
    confirmedAt: null,
    paidAt: null,
    lastPaymentEvent: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeReservation(reservation);
  await upsertLeadFromReservation(buildLeadSyncPayload(reservation, input.attribution));

  return reservation;
}

export async function attachCheckoutSessionToReservation(
  reservationId: string,
  session: Pick<Stripe.Checkout.Session, 'id' | 'amount_total' | 'currency' | 'customer'>
) {
  const reservation = await readReservation(reservationId);

  if (!reservation) {
    throw new Error('Reservation not found.');
  }

  const nextReservation: ReservationRecord = {
    ...reservation,
    checkoutSessionId: session.id,
    amountTotal: session.amount_total ?? reservation.amountTotal,
    currency: session.currency ?? reservation.currency,
    stripeCustomerId:
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || reservation.stripeCustomerId,
    updatedAt: nowIso(),
  };

  await writeReservation(nextReservation);
  await upsertLeadFromReservation(buildLeadSyncPayload(nextReservation));
}

export async function getReservation(reservationId: string) {
  try {
    return await readReservation(reservationId);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Reservation reference is invalid.') {
      return null;
    }

    throw error;
  }
}

export async function listReservations() {
  const reservations = await listStoredReservations();

  return reservations.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function syncReservationFromCheckoutSession(
  session: Stripe.Checkout.Session,
  eventType?: string
) {
  const fromMetadata = getReservationFromSessionMetadata(session);

  if (!fromMetadata) {
    return null;
  }

  const existing = await readReservation(fromMetadata.id);
  const timestamp = nowIso();
  const paymentStatus = resolvePaymentStatus(session, eventType);
  const currentStatus = existing?.status || fromMetadata.status;
  const nextStatus = resolveReservationStatus(currentStatus, paymentStatus);
  const reservation: ReservationRecord = {
    ...(existing || {
      ...fromMetadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    ...fromMetadata,
    checkoutSessionId: session.id,
    stripeCustomerId:
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || existing?.stripeCustomerId || null,
    amountTotal: session.amount_total ?? existing?.amountTotal ?? null,
    currency: session.currency ?? existing?.currency ?? 'usd',
    paymentStatus,
    status: nextStatus,
    paidAt:
      paymentStatus === 'paid' ? existing?.paidAt || timestamp : existing?.paidAt || null,
    lastPaymentEvent: eventType || existing?.lastPaymentEvent || null,
    updatedAt: timestamp,
  };

  await writeReservation(reservation);
  await upsertLeadFromReservation(buildLeadSyncPayload(reservation));

  return reservation;
}

export async function updateReservationByAdmin(
  reservationId: string,
  update: AdminReservationUpdate
) {
  const reservation = await readReservation(reservationId);

  if (!reservation) {
    throw new Error('Reservation not found.');
  }

  if (!reservationStatuses.includes(update.status)) {
    throw new Error('Reservation status is invalid.');
  }

  const scheduledDate = normalizeOptionalDate(update.scheduledDate);
  const scheduledWindow = normalizeOptionalText(update.scheduledWindow, 120);
  const adminNotes = normalizeOptionalText(update.adminNotes, 1200);
  const timestamp = nowIso();

  const nextReservation: ReservationRecord = {
    ...reservation,
    status: update.status,
    scheduledDate,
    scheduledWindow,
    adminNotes,
    confirmedAt:
      update.status === 'confirmed' ? reservation.confirmedAt || timestamp : reservation.confirmedAt,
    updatedAt: timestamp,
  };

  await writeReservation(nextReservation);
  await upsertLeadFromReservation(buildLeadSyncPayload(nextReservation));

  return nextReservation;
}

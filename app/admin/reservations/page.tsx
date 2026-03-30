import type { Metadata } from 'next';
import Link from 'next/link';
import { logoutAction, updateReservationAction } from '@/app/admin/actions';
import { requireAdminSession } from '@/lib/admin-auth';
import {
  filterReservations,
  formatReservationReference,
  getReservationPaymentStatusLabel,
  getReservationStatusLabel,
  listReservations,
  reservationPaymentStatuses,
  reservationStatuses,
  type ReservationPaymentStatus,
  type ReservationRecord,
  type ReservationStatus,
} from '@/lib/reservations';

export const metadata: Metadata = {
  title: 'Reservations',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type AdminReservationsPageProps = {
  searchParams: Promise<{
    error?: string;
    paymentStatus?: string;
    query?: string;
    status?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

function getStatusClasses(status: ReservationStatus) {
  switch (status) {
    case 'confirmed':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    case 'pending_review':
      return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
    case 'needs_attention':
      return 'border-red-500/30 bg-red-500/10 text-red-100';
    case 'canceled':
      return 'border-white/15 bg-white/5 text-stone-200';
    default:
      return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }
}

function isWithinNextDays(date: string, days: number) {
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const future = new Date(today);
  future.setDate(future.getDate() + days);

  const target = new Date(`${date}T00:00:00`);
  return target >= today && target <= future;
}

function normalizeStatusFilter(value?: string): ReservationStatus | 'all' {
  return value && reservationStatuses.includes(value as ReservationStatus)
    ? (value as ReservationStatus)
    : 'all';
}

function normalizePaymentFilter(value?: string): ReservationPaymentStatus | 'all' {
  return value && reservationPaymentStatuses.includes(value as ReservationPaymentStatus)
    ? (value as ReservationPaymentStatus)
    : 'all';
}

function buildExportHref(query: string, status: string, paymentStatus: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set('query', query);
  }

  if (status !== 'all') {
    params.set('status', status);
  }

  if (paymentStatus !== 'all') {
    params.set('paymentStatus', paymentStatus);
  }

  const serialized = params.toString();
  return serialized ? `/admin/reservations/export?${serialized}` : '/admin/reservations/export';
}

function ReservationCard({ reservation }: { reservation: ReservationRecord }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Reservation</p>
          <h2 className="mt-2 font-serif text-3xl text-white">
            {formatReservationReference(reservation.id)}
          </h2>
          <p className="mt-2 text-sm leading-7 text-stone-300">
            {reservation.itemName} for {reservation.customerName}
          </p>
          <p className="text-sm leading-7 text-stone-400">
            Created {formatDateTime(reservation.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getStatusClasses(
              reservation.status
            )}`}
          >
            {getReservationStatusLabel(reservation.status)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-200">
            {getReservationPaymentStatusLabel(reservation.paymentStatus)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm leading-7 text-stone-200 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Contact</p>
          <p className="mt-2">{reservation.email}</p>
          <p>{reservation.phone}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${reservation.phone}`}
              className="inline-flex items-center justify-center border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Call
            </a>
            <a
              href={`mailto:${reservation.email}?subject=${encodeURIComponent(`Wakala reservation ${formatReservationReference(reservation.id)}`)}`}
              className="inline-flex items-center justify-center border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Email
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Service Address</p>
          <p className="mt-2">{reservation.serviceAddress}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Customer Request</p>
          <p className="mt-2">
            Preferred date:{' '}
            {reservation.preferredDate ? formatDate(reservation.preferredDate) : 'Not specified'}
          </p>
          <p>
            Payment:{' '}
            {typeof reservation.amountTotal === 'number'
              ? formatCurrency(reservation.amountTotal)
              : 'Pending'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Schedule</p>
          <p className="mt-2">
            Date: {reservation.scheduledDate ? formatDate(reservation.scheduledDate) : 'Unscheduled'}
          </p>
          <p>Window: {reservation.scheduledWindow || 'Unscheduled'}</p>
        </div>
      </div>

      {reservation.notes ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-stone-300">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Placement Notes</p>
          <p className="mt-2">{reservation.notes}</p>
        </div>
      ) : null}

      <form
        action={updateReservationAction}
        className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_0.9fr_1.3fr_auto]"
      >
        <input type="hidden" name="reservationId" value={reservation.id} />

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Status
          </label>
          <select
            name="status"
            defaultValue={reservation.status}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          >
            {reservationStatuses.map((status) => (
              <option key={status} value={status}>
                {getReservationStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Scheduled Date
          </label>
          <input
            name="scheduledDate"
            type="date"
            defaultValue={reservation.scheduledDate}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Delivery Window
          </label>
          <input
            name="scheduledWindow"
            type="text"
            defaultValue={reservation.scheduledWindow}
            maxLength={120}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Example: 8:00 AM to 10:00 AM"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Save
          </button>
        </div>

        <div className="space-y-2 lg:col-span-4">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Internal Notes
          </label>
          <textarea
            name="adminNotes"
            rows={3}
            defaultValue={reservation.adminNotes}
            maxLength={1200}
            className="min-h-[7rem] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Site access issues, follow-up tasks, or confirmation notes for the team"
          />
        </div>
      </form>
    </article>
  );
}

export default async function AdminReservationsPage({
  searchParams,
}: AdminReservationsPageProps) {
  await requireAdminSession();

  const allReservations = await listReservations();
  const { error, paymentStatus: rawPaymentStatus, query = '', status: rawStatus } =
    await searchParams;
  const status = normalizeStatusFilter(rawStatus);
  const paymentStatus = normalizePaymentFilter(rawPaymentStatus);
  const reservations = filterReservations(allReservations, {
    paymentStatus,
    query,
    status,
  });
  const hasActiveFilters = Boolean(query || status !== 'all' || paymentStatus !== 'all');

  const stats = {
    total: allReservations.length,
    filtered: reservations.length,
    paidRevenue: allReservations
      .filter(
        (reservation) =>
          reservation.paymentStatus === 'paid' && typeof reservation.amountTotal === 'number'
      )
      .reduce((total, reservation) => total + (reservation.amountTotal || 0), 0),
    pendingReview: allReservations.filter((reservation) => reservation.status === 'pending_review')
      .length,
    upcomingThisWeek: allReservations.filter(
      (reservation) =>
        reservation.status === 'confirmed' && isWithinNextDays(reservation.scheduledDate, 7)
    ).length,
    unscheduledPaid: allReservations.filter(
      (reservation) =>
        reservation.paymentStatus === 'paid' &&
        reservation.status !== 'canceled' &&
        !reservation.scheduledDate
    ).length,
    attention: allReservations.filter((reservation) => reservation.status === 'needs_attention')
      .length,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Admin</p>
          <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">
            Reservation dashboard
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
            Confirm paid reservations, assign delivery windows, track revenue, and keep the daily
            dispatch workflow in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            View site
          </Link>
          <Link
            href={buildExportHref(query, status, paymentStatus)}
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Export CSV
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center border border-amber-300/40 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Paid Revenue</p>
          <p className="mt-3 font-serif text-4xl text-white">{formatCurrency(stats.paidRevenue)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Filtered Results</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.filtered}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Pending Review</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.pendingReview}</p>
        </div>
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Scheduled Next 7 Days</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.upcomingThisWeek}</p>
        </div>
        <div className="rounded-[1.5rem] border border-sky-400/20 bg-sky-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Paid But Unscheduled</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.unscheduledPaid}</p>
        </div>
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Needs Attention</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.attention}</p>
        </div>
      </div>

      <form method="get" className="panel mt-8 grid gap-4 rounded-[2rem] p-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Search
          </label>
          <input
            name="query"
            type="text"
            defaultValue={query}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Customer, email, phone, address, or reference"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Status
          </label>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          >
            <option value="all">All statuses</option>
            {reservationStatuses.map((reservationStatus) => (
              <option key={reservationStatus} value={reservationStatus}>
                {getReservationStatusLabel(reservationStatus)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Payment
          </label>
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          >
            <option value="all">All payments</option>
            {reservationPaymentStatuses.map((reservationPaymentStatus) => (
              <option key={reservationPaymentStatus} value={reservationPaymentStatus}>
                {getReservationPaymentStatusLabel(reservationPaymentStatus)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Apply
          </button>
        </div>

        <div className="flex items-end">
          <Link
            href="/admin/reservations"
            className="inline-flex w-full items-center justify-center border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            {hasActiveFilters ? 'Reset' : 'Refresh'}
          </Link>
        </div>
      </form>

      {error ? (
        <p
          className="mt-6 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {reservations.length === 0 ? (
        <section className="panel mt-8 rounded-[2rem] p-8 md:p-12">
          <p className="text-sm leading-7 text-stone-300">
            {allReservations.length === 0
              ? 'Reservations will appear here after a customer submits the checkout form.'
              : 'No reservations matched the current filter.'}
          </p>
        </section>
      ) : (
        <section className="mt-8 space-y-6">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </section>
      )}
    </div>
  );
}

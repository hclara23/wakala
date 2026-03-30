import type { Metadata } from 'next';
import Link from 'next/link';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminWorkflowWizard from '@/components/admin/AdminWorkflowWizard';
import { logoutAction, updateLeadAction } from '@/app/admin/actions';
import { requireAdminSession } from '@/lib/admin-auth';
import { getGoogleAnalyticsDashboard } from '@/lib/google-analytics';
import {
  filterLeadsByAge,
  filterLeads,
  formatLeadReference,
  getLeadFollowUpStatusLabel,
  getLeadPipelineStatusLabel,
  getLeadQuoteStatusLabel,
  getLeadReviewStatusLabel,
  getLeadSourceLabel,
  isLeadFollowUpDue,
  leadFollowUpStatuses,
  leadPipelineStatuses,
  leadQuoteStatuses,
  leadReviewStatuses,
  leadSourceTypes,
  listLeads,
  type LeadFollowUpStatus,
  type LeadPipelineStatus,
  type LeadQuoteStatus,
  type LeadRecord,
  type LeadReviewStatus,
  type LeadSourceType,
} from '@/lib/leads';
import { formatReservationReference } from '@/lib/reservations';

export const metadata: Metadata = {
  title: 'Lead Inbox',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type AdminLeadsPageProps = {
  searchParams: Promise<{
    error?: string;
    pipelineStatus?: string;
    query?: string;
    source?: string;
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

function formatCurrencyInput(amountInCents: number | null) {
  return typeof amountInCents === 'number' ? (amountInCents / 100).toFixed(2) : '';
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function divideOrZero(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function normalizePipelineFilter(value?: string): LeadPipelineStatus | 'all' {
  return value && leadPipelineStatuses.includes(value as LeadPipelineStatus)
    ? (value as LeadPipelineStatus)
    : 'all';
}

function normalizeSourceFilter(value?: string): LeadSourceType | 'all' {
  return value && leadSourceTypes.includes(value as LeadSourceType)
    ? (value as LeadSourceType)
    : 'all';
}

function buildExportHref(query: string, pipelineStatus: string, source: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set('query', query);
  }

  if (pipelineStatus !== 'all') {
    params.set('pipelineStatus', pipelineStatus);
  }

  if (source !== 'all') {
    params.set('source', source);
  }

  const serialized = params.toString();
  return serialized ? `/admin/leads/export?${serialized}` : '/admin/leads/export';
}

function getPipelineClasses(status: LeadPipelineStatus) {
  switch (status) {
    case 'won':
    case 'scheduled':
    case 'completed':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    case 'quoted':
      return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
    case 'lost':
      return 'border-red-500/30 bg-red-500/10 text-red-100';
    case 'contacted':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
    default:
      return 'border-white/15 bg-white/5 text-stone-200';
  }
}

function getQuoteClasses(status: LeadQuoteStatus) {
  switch (status) {
    case 'accepted':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    case 'sent':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
    case 'declined':
      return 'border-red-500/30 bg-red-500/10 text-red-100';
    case 'draft':
      return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
    default:
      return 'border-white/15 bg-white/5 text-stone-200';
  }
}

function getReviewClasses(status: LeadReviewStatus) {
  switch (status) {
    case 'received':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    case 'requested':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
    default:
      return 'border-white/15 bg-white/5 text-stone-200';
  }
}

function getFollowUpClasses(status: LeadFollowUpStatus, due: boolean) {
  if (status === 'completed') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (due) {
    return 'border-red-500/30 bg-red-500/10 text-red-100';
  }

  if (status === 'scheduled') {
    return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
  }

  return 'border-white/15 bg-white/5 text-stone-200';
}

function getConversionCount(
  conversions: Array<{ eventKey: string; count: number }>,
  eventKey: string
) {
  return conversions.find((conversion) => conversion.eventKey === eventKey)?.count || 0;
}

function LeadCard({ lead }: { lead: LeadRecord }) {
  const hasAttribution = Boolean(
    lead.landingPage ||
      lead.referrerHost ||
      lead.utmSource ||
      lead.utmMedium ||
      lead.utmCampaign ||
      lead.utmTerm ||
      lead.utmContent
  );
  const followUpDue = isLeadFollowUpDue(lead);
  const hasQuote = typeof lead.quoteAmount === 'number' || Boolean(lead.quoteSummary);
  const hasJob = Boolean(lead.jobCreatedAt || lead.jobScheduledDate || lead.jobScheduledWindow);

  return (
    <article className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{lead.sourceLabel}</p>
          <h2 className="mt-2 font-serif text-3xl text-white">{lead.customerName}</h2>
          <p className="mt-2 text-sm leading-7 text-stone-300">
            {lead.serviceType} lead · {formatLeadReference(lead.id)}
          </p>
          <p className="text-sm leading-7 text-stone-400">Created {formatDateTime(lead.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getPipelineClasses(
              lead.pipelineStatus
            )}`}
          >
            {getLeadPipelineStatusLabel(lead.pipelineStatus)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-200">
            {getLeadSourceLabel(lead.source)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getQuoteClasses(
              lead.quoteStatus
            )}`}
          >
            {getLeadQuoteStatusLabel(lead.quoteStatus)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getFollowUpClasses(
              lead.followUpStatus,
              followUpDue
            )}`}
          >
            {getLeadFollowUpStatusLabel(lead.followUpStatus)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getReviewClasses(
              lead.reviewStatus
            )}`}
          >
            {getLeadReviewStatusLabel(lead.reviewStatus)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm leading-7 text-stone-200 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Contact</p>
          <p className="mt-2 break-all">{lead.email}</p>
          <p>{lead.phone}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center justify-center border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Call
            </a>
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(`Wakala ${lead.serviceType} lead ${formatLeadReference(lead.id)}`)}`}
              className="inline-flex items-center justify-center border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Email
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Service</p>
          <p className="mt-2">{lead.serviceType}</p>
          <p className="text-stone-400">{lead.serviceAddress || 'Address not provided'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Acquisition</p>
          <p className="mt-2">Landing page: {lead.landingPage || 'Unknown'}</p>
          <p>Referrer: {lead.referrerHost || 'Direct / unavailable'}</p>
          <p>
            Campaign:{' '}
            {lead.utmCampaign || lead.utmSource || lead.utmMedium
              ? [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ')
              : 'None tagged'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Commercial Value</p>
          <p className="mt-2">
            Amount:{' '}
            {typeof lead.amountTotal === 'number' ? formatCurrency(lead.amountTotal) : 'Quote pending'}
          </p>
          <p>Payment: {lead.paymentStatus || 'Quote inquiry'}</p>
          <p>Reservation: {lead.reservationId ? formatReservationReference(lead.reservationId) : 'No reservation link'}</p>
          {lead.reservationId ? (
            <Link
              href={`/admin/reservations?query=${encodeURIComponent(lead.reservationId)}`}
              className="mt-3 inline-flex items-center justify-center border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Open reservation
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm leading-7 text-stone-200 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Follow-Up Reminder</p>
          <p className="mt-2">
            {lead.followUpDate
              ? `${formatDate(lead.followUpDate)}${followUpDue ? ' - due now' : ''}`
              : 'No reminder scheduled'}
          </p>
          <p className="text-stone-400">
            {lead.followUpCompletedAt
              ? `Completed ${formatDateTime(lead.followUpCompletedAt)}`
              : 'Use reminders to keep callbacks from slipping.'}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Quote Builder</p>
          <p className="mt-2">
            {typeof lead.quoteAmount === 'number'
              ? formatCurrency(lead.quoteAmount)
              : 'No quote amount saved'}
          </p>
          <p className="text-stone-400">
            {lead.quoteSentAt
              ? `Last sent ${formatDateTime(lead.quoteSentAt)}`
              : 'Draft, send, and accept quotes from this card.'}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Review Tracker</p>
          <p className="mt-2">{getLeadReviewStatusLabel(lead.reviewStatus)}</p>
          <p className="text-stone-400">
            {lead.reviewReceivedAt
              ? `Received ${formatDateTime(lead.reviewReceivedAt)}`
              : lead.reviewRequestedAt
                ? `Requested ${formatDateTime(lead.reviewRequestedAt)}`
                : 'Request a review after the job is finished.'}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Job Conversion</p>
          <p className="mt-2">
            {hasJob
              ? lead.jobScheduledDate
                ? `Scheduled ${formatDate(lead.jobScheduledDate)}`
                : 'Converted to job'
              : 'Not yet converted'}
          </p>
          <p className="text-stone-400">
            {lead.jobScheduledWindow || 'Add a date/window and convert the quote into a live job.'}
          </p>
        </div>
      </div>

      {lead.details ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-stone-300">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Lead Details</p>
          <p className="mt-2 whitespace-pre-line">{lead.details}</p>
        </div>
      ) : null}

      {hasQuote ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-stone-300">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Quote Summary</p>
          <p className="mt-2 whitespace-pre-line">
            {lead.quoteSummary || 'Quote amount saved without a written summary yet.'}
          </p>
        </div>
      ) : null}

      {hasAttribution ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-stone-300">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Tracking Snapshot</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p>Page URL: {lead.pageUrl || 'Unknown'}</p>
            <p>Referrer URL: {lead.referrer || 'Unavailable'}</p>
            <p>UTM source: {lead.utmSource || 'Not tagged'}</p>
            <p>UTM medium: {lead.utmMedium || 'Not tagged'}</p>
            <p>UTM campaign: {lead.utmCampaign || 'Not tagged'}</p>
            <p>UTM content: {lead.utmContent || 'Not tagged'}</p>
          </div>
        </div>
      ) : null}

      <form action={updateLeadAction} className="mt-6 space-y-5">
        <input type="hidden" name="leadId" value={lead.id} />

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Pipeline Status
            </label>
            <select
              name="pipelineStatus"
              defaultValue={lead.pipelineStatus}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            >
              {leadPipelineStatuses.map((status) => (
                <option key={status} value={status}>
                  {getLeadPipelineStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Follow-Up Status
            </label>
            <select
              name="followUpStatus"
              defaultValue={lead.followUpStatus}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            >
              {leadFollowUpStatuses.map((status) => (
                <option key={status} value={status}>
                  {getLeadFollowUpStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Follow-Up Date
            </label>
            <input
              name="followUpDate"
              type="date"
              defaultValue={lead.followUpDate}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Review Status
            </label>
            <select
              name="reviewStatus"
              defaultValue={lead.reviewStatus}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            >
              {leadReviewStatuses.map((status) => (
                <option key={status} value={status}>
                  {getLeadReviewStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Quote Status
            </label>
            <select
              name="quoteStatus"
              defaultValue={lead.quoteStatus}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            >
              {leadQuoteStatuses.map((status) => (
                <option key={status} value={status}>
                  {getLeadQuoteStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Quote Amount
            </label>
            <input
              name="quoteAmount"
              type="text"
              inputMode="decimal"
              defaultValue={formatCurrencyInput(lead.quoteAmount)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
              placeholder="1250.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Job Date
            </label>
            <input
              name="jobScheduledDate"
              type="date"
              defaultValue={lead.jobScheduledDate}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
              Job Window
            </label>
            <input
              name="jobScheduledWindow"
              type="text"
              defaultValue={lead.jobScheduledWindow}
              maxLength={120}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
              placeholder="Example: 9:00 AM to 11:00 AM"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Quote Scope
          </label>
          <textarea
            name="quoteSummary"
            rows={3}
            defaultValue={lead.quoteSummary}
            maxLength={2400}
            className="min-h-[7rem] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Line items, exclusions, service notes, or what the quote includes."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Internal Notes
          </label>
          <textarea
            name="adminNotes"
            rows={3}
            defaultValue={lead.adminNotes}
            maxLength={1200}
            className="min-h-[7rem] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Callback timing, objections, crew notes, or customer preferences."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="intent"
            value="save"
            className="inline-flex items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Save
          </button>
          <button
            type="submit"
            name="intent"
            value="convert_to_job"
            className="inline-flex items-center justify-center border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Convert To Job
          </button>
        </div>
      </form>
    </article>
  );
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdminSession();

  const [allLeads, analytics] = await Promise.all([listLeads(), getGoogleAnalyticsDashboard()]);
  const { error, pipelineStatus: rawPipelineStatus, query = '', source: rawSource } =
    await searchParams;
  const pipelineStatus = normalizePipelineFilter(rawPipelineStatus);
  const source = normalizeSourceFilter(rawSource);
  const leads = filterLeads(allLeads, {
    pipelineStatus,
    query,
    source,
  });
  const hasActiveFilters = Boolean(query || pipelineStatus !== 'all' || source !== 'all');

  const wonStatuses = new Set<LeadPipelineStatus>(['won', 'scheduled', 'completed']);
  const openStatuses = new Set<LeadPipelineStatus>(['new', 'contacted', 'quoted']);
  const analyticsWindowDays = analytics.dateRangeDays || 30;
  const recentLeads = filterLeadsByAge(allLeads, analyticsWindowDays);
  const recentQuoteRequests = recentLeads.filter((lead) => lead.source === 'quote_request');
  const recentReservationStarts = recentLeads.filter((lead) => lead.source === 'reservation');
  const recentPaidReservations = recentReservationStarts.filter(
    (lead) => lead.paymentStatus === 'paid'
  );
  const recentWonLeads = recentLeads.filter((lead) => wonStatuses.has(lead.pipelineStatus));
  const recentRevenue = recentPaidReservations.reduce(
    (total, lead) => total + (lead.amountTotal || 0),
    0
  );
  const sessionCount = analytics.summary?.sessions || 0;
  const trackedLeadEvents = getConversionCount(analytics.conversions, 'generate_lead');
  const trackedCheckoutStarts = getConversionCount(analytics.conversions, 'begin_checkout');
  const trackedPurchases = getConversionCount(analytics.conversions, 'purchase');
  const stats = {
    total: allLeads.length,
    quoteRequests: allLeads.filter((lead) => lead.source === 'quote_request').length,
    reservationLeads: allLeads.filter((lead) => lead.source === 'reservation').length,
    openPipeline: allLeads.filter((lead) => openStatuses.has(lead.pipelineStatus)).length,
    closedWon: allLeads.filter((lead) => wonStatuses.has(lead.pipelineStatus)).length,
    followUpsDue: allLeads.filter((lead) => isLeadFollowUpDue(lead)).length,
    reviewRequestsOpen: allLeads.filter((lead) => lead.reviewStatus === 'requested').length,
    activeQuotes: allLeads.filter((lead) => ['draft', 'sent'].includes(lead.quoteStatus)).length,
    closeRate:
      allLeads.length > 0
        ? allLeads.filter((lead) => wonStatuses.has(lead.pipelineStatus)).length / allLeads.length
        : 0,
  };
  const funnelStats = {
    sessions: sessionCount,
    capturedLeads: recentLeads.length,
    quoteRequests: recentQuoteRequests.length,
    reservationStarts: recentReservationStarts.length,
    paidReservations: recentPaidReservations.length,
    wonJobs: recentWonLeads.length,
    recentRevenue,
    trackedLeadEvents,
    trackedCheckoutStarts,
    trackedPurchases,
    leadCaptureRate: divideOrZero(recentLeads.length, sessionCount),
    checkoutStartRate: divideOrZero(trackedCheckoutStarts, sessionCount),
    checkoutCompletionRate: divideOrZero(trackedPurchases, trackedCheckoutStarts),
    leadToWinRate: divideOrZero(recentWonLeads.length, recentLeads.length),
    averagePaidReservationValue: divideOrZero(recentRevenue, recentPaidReservations.length),
  };

  const landingPages = Array.from(
    recentLeads.reduce((map, lead) => {
      const key = lead.landingPage || '(unknown)';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const campaigns = Array.from(
    recentLeads.reduce((map, lead) => {
      const key =
        lead.utmCampaign ||
        [lead.utmSource, lead.utmMedium].filter(Boolean).join(' / ') ||
        '';

      if (!key) {
        return map;
      }

      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const referrers = Array.from(
    recentLeads.reduce((map, lead) => {
      const key = lead.referrerHost || 'direct';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Admin</p>
          <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">Lead inbox</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
            Track every quote request and online reservation in one pipeline, keep follow-up notes,
            and see which acquisition paths are producing real jobs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <AdminNavigation current="leads" />
          <AdminWorkflowWizard current="leads" />
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            View site
          </Link>
          <Link
            href={buildExportHref(query, pipelineStatus, source)}
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
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Total Leads</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.total}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Quote Requests</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.quoteRequests}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Reservation Leads</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.reservationLeads}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Open Pipeline</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.openPipeline}</p>
        </div>
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Closed Won</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.closedWon}</p>
        </div>
        <div className="rounded-[1.5rem] border border-sky-400/20 bg-sky-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Close Rate</p>
          <p className="mt-3 font-serif text-4xl text-white">{formatPercent(stats.closeRate)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Follow-Ups Due</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.followUpsDue}</p>
        </div>
        <div className="rounded-[1.5rem] border border-sky-400/20 bg-sky-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Reviews Requested</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.reviewRequestsOpen}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Active Quotes</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.activeQuotes}</p>
        </div>
      </div>

      <section className="panel mt-8 rounded-[2rem] p-6 md:p-8">
        <div>
          <p className="section-kicker">Funnel</p>
          <h2 className="mt-3 font-serif text-3xl text-white">
            {analyticsWindowDays}-day acquisition funnel
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
            Combine website sessions, tracked web events, and saved lead records to see what is
            turning into paid and won work.
          </p>
        </div>

        {analytics.message ? (
          <p className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/8 px-4 py-3 text-sm leading-7 text-stone-200">
            {analytics.message}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Sessions / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.sessions)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Captured Leads / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.capturedLeads)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Quote Requests / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.quoteRequests)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-sky-400/20 bg-sky-400/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Reservation Starts / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.reservationStarts)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Paid Reservations / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.paidReservations)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Jobs Won / {analyticsWindowDays} Days
            </p>
            <p className="mt-3 font-serif text-4xl text-white">
              {formatWholeNumber(funnelStats.wonJobs)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Tracked Events</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Project builder submits</span>
                <span className="text-sm font-semibold text-white">
                  {formatWholeNumber(funnelStats.trackedLeadEvents)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Checkout starts</span>
                <span className="text-sm font-semibold text-white">
                  {formatWholeNumber(funnelStats.trackedCheckoutStarts)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Stripe purchases</span>
                <span className="text-sm font-semibold text-white">
                  {formatWholeNumber(funnelStats.trackedPurchases)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Conversion Rates</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Session to lead</span>
                <span className="text-sm font-semibold text-white">
                  {formatPercent(funnelStats.leadCaptureRate)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Session to checkout</span>
                <span className="text-sm font-semibold text-white">
                  {formatPercent(funnelStats.checkoutStartRate)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Checkout to purchase</span>
                <span className="text-sm font-semibold text-white">
                  {formatPercent(funnelStats.checkoutCompletionRate)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Lead to won job</span>
                <span className="text-sm font-semibold text-white">
                  {formatPercent(funnelStats.leadToWinRate)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Revenue Snapshot / {analyticsWindowDays} Days
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Paid reservation revenue</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(funnelStats.recentRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-stone-200">Average paid reservation</span>
                <span className="text-sm font-semibold text-white">
                  {funnelStats.paidReservations > 0
                    ? formatCurrency(funnelStats.averagePaidReservationValue)
                    : '$0.00'}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-stone-300">
                Use the lead pipeline for quotes and follow-up, and use reservation operations for
                delivery dates, payment status, and dispatch notes.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel mt-8 rounded-[2rem] p-6 md:p-8">
        <div>
          <p className="section-kicker">Acquisition</p>
          <h2 className="mt-3 font-serif text-3xl text-white">
            Lead source snapshot / {analyticsWindowDays} days
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
            See which landing pages, campaigns, and intake paths are creating actual opportunities
            for the business.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Source Mix</p>
            <div className="mt-4 space-y-3">
              {leadSourceTypes.map((leadSource) => {
                const count = recentLeads.filter((lead) => lead.source === leadSource).length;

                return (
                  <div
                    key={leadSource}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <span className="text-sm text-stone-200">{getLeadSourceLabel(leadSource)}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Top Landing Pages</p>
            <div className="mt-4 space-y-3">
              {landingPages.length > 0 ? (
                landingPages.map(([page, count]) => (
                  <div
                    key={page}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <span className="truncate text-sm text-stone-200">{page}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-stone-400">
                  Landing page data will populate as new leads come in.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Campaign Tags</p>
            <div className="mt-4 space-y-3">
              {campaigns.length > 0 ? (
                campaigns.map(([campaign, count]) => (
                  <div
                    key={campaign}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <span className="truncate text-sm text-stone-200">{campaign}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-stone-400">
                  Add UTM parameters to ads and campaign links to see marketing performance here.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Referrer Hosts</p>
            <div className="mt-4 space-y-3">
              {referrers.length > 0 ? (
                referrers.map(([referrer, count]) => (
                  <div
                    key={referrer}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <span className="truncate text-sm text-stone-200">{referrer}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-stone-400">
                  Referrer data will populate as new leads come in from search, ads, and partner
                  links.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <form
        method="get"
        className="panel mt-8 grid gap-4 rounded-[2rem] p-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto]"
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Search
          </label>
          <input
            name="query"
            type="text"
            defaultValue={query}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Customer, service, email, phone, reservation, or campaign"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Pipeline
          </label>
          <select
            name="pipelineStatus"
            defaultValue={pipelineStatus}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          >
            <option value="all">All pipeline stages</option>
            {leadPipelineStatuses.map((status) => (
              <option key={status} value={status}>
                {getLeadPipelineStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
            Source
          </label>
          <select
            name="source"
            defaultValue={source}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          >
            <option value="all">All sources</option>
            {leadSourceTypes.map((leadSource) => (
              <option key={leadSource} value={leadSource}>
                {getLeadSourceLabel(leadSource)}
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
            href="/admin/leads"
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

      {leads.length === 0 ? (
        <section className="panel mt-8 rounded-[2rem] p-8 md:p-12">
          <p className="text-sm leading-7 text-stone-300">
            {allLeads.length === 0
              ? 'Leads will appear here after a visitor submits the project builder form or starts the reservation flow.'
              : 'No leads matched the current filter.'}
          </p>
        </section>
      ) : (
        <section className="mt-8 space-y-6">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </section>
      )}
    </div>
  );
}

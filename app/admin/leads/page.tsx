import type { Metadata } from 'next';
import Link from 'next/link';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { logoutAction, updateLeadAction } from '@/app/admin/actions';
import { requireAdminSession } from '@/lib/admin-auth';
import {
  filterLeads,
  formatLeadReference,
  getLeadPipelineStatusLabel,
  getLeadSourceLabel,
  leadPipelineStatuses,
  leadSourceTypes,
  listLeads,
  type LeadPipelineStatus,
  type LeadRecord,
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

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
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

      {lead.details ? (
        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-stone-300">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Lead Details</p>
          <p className="mt-2 whitespace-pre-line">{lead.details}</p>
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

      <form action={updateLeadAction} className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.3fr_auto]">
        <input type="hidden" name="leadId" value={lead.id} />

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
            Internal Notes
          </label>
          <textarea
            name="adminNotes"
            rows={3}
            defaultValue={lead.adminNotes}
            maxLength={1200}
            className="min-h-[7rem] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
            placeholder="Quote amount, callback timing, objections, or next step"
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
      </form>
    </article>
  );
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdminSession();

  const allLeads = await listLeads();
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
  const stats = {
    total: allLeads.length,
    quoteRequests: allLeads.filter((lead) => lead.source === 'quote_request').length,
    reservationLeads: allLeads.filter((lead) => lead.source === 'reservation').length,
    openPipeline: allLeads.filter((lead) => openStatuses.has(lead.pipelineStatus)).length,
    closedWon: allLeads.filter((lead) => wonStatuses.has(lead.pipelineStatus)).length,
    closeRate:
      allLeads.length > 0
        ? allLeads.filter((lead) => wonStatuses.has(lead.pipelineStatus)).length / allLeads.length
        : 0,
  };

  const landingPages = Array.from(
    allLeads.reduce((map, lead) => {
      const key = lead.landingPage || '(unknown)';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const campaigns = Array.from(
    allLeads.reduce((map, lead) => {
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
      </div>

      <section className="panel mt-8 rounded-[2rem] p-6 md:p-8">
        <div>
          <p className="section-kicker">Acquisition</p>
          <h2 className="mt-3 font-serif text-3xl text-white">Lead source snapshot</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
            See which landing pages, campaigns, and intake paths are creating actual opportunities
            for the business.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Source Mix</p>
            <div className="mt-4 space-y-3">
              {leadSourceTypes.map((leadSource) => {
                const count = allLeads.filter((lead) => lead.source === leadSource).length;

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

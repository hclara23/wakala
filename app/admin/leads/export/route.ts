import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';
import {
  filterLeads,
  formatLeadReference,
  getLeadPipelineStatusLabel,
  getLeadSourceLabel,
  leadPipelineStatuses,
  leadSourceTypes,
  listLeads,
  type LeadPipelineStatus,
  type LeadSourceType,
} from '@/lib/leads';

export const runtime = 'nodejs';

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

function escapeCsv(value: string | number | null) {
  const serialized = value === null ? '' : String(value);
  return `"${serialized.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const pipelineStatus = normalizePipelineFilter(searchParams.get('pipelineStatus') || undefined);
  const source = normalizeSourceFilter(searchParams.get('source') || undefined);
  const leads = filterLeads(await listLeads(), {
    pipelineStatus,
    query,
    source,
  });

  const rows = [
    [
      'Reference',
      'Pipeline Status',
      'Source',
      'Service Type',
      'Customer',
      'Email',
      'Phone',
      'Service Address',
      'Reservation Reference',
      'Payment Status',
      'Amount',
      'Landing Page',
      'Referrer Host',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Details',
      'Admin Notes',
      'Created At',
      'Updated At',
    ],
    ...leads.map((lead) => [
      formatLeadReference(lead.id),
      getLeadPipelineStatusLabel(lead.pipelineStatus),
      getLeadSourceLabel(lead.source),
      lead.serviceType,
      lead.customerName,
      lead.email,
      lead.phone,
      lead.serviceAddress,
      lead.reservationId ? lead.reservationId.toUpperCase() : '',
      lead.paymentStatus,
      typeof lead.amountTotal === 'number' ? (lead.amountTotal / 100).toFixed(2) : '',
      lead.landingPage,
      lead.referrerHost,
      lead.utmSource,
      lead.utmMedium,
      lead.utmCampaign,
      lead.details,
      lead.adminNotes,
      lead.createdAt,
      lead.updatedAt,
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
  const filename = `wakala-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}

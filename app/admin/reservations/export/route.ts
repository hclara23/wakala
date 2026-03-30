import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';
import {
  filterReservations,
  formatReservationReference,
  getReservationPaymentStatusLabel,
  getReservationStatusLabel,
  listReservations,
  reservationPaymentStatuses,
  reservationStatuses,
  type ReservationPaymentStatus,
  type ReservationStatus,
} from '@/lib/reservations';

export const runtime = 'nodejs';

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
  const status = normalizeStatusFilter(searchParams.get('status') || undefined);
  const paymentStatus = normalizePaymentFilter(searchParams.get('paymentStatus') || undefined);
  const reservations = filterReservations(await listReservations(), {
    paymentStatus,
    query,
    status,
  });

  const rows = [
    [
      'Reference',
      'Status',
      'Payment Status',
      'Customer',
      'Email',
      'Phone',
      'Service Address',
      'Preferred Date',
      'Scheduled Date',
      'Delivery Window',
      'Amount',
      'Created At',
      'Updated At',
      'Admin Notes',
    ],
    ...reservations.map((reservation) => [
      formatReservationReference(reservation.id),
      getReservationStatusLabel(reservation.status),
      getReservationPaymentStatusLabel(reservation.paymentStatus),
      reservation.customerName,
      reservation.email,
      reservation.phone,
      reservation.serviceAddress,
      reservation.preferredDate,
      reservation.scheduledDate,
      reservation.scheduledWindow,
      reservation.amountTotal ? (reservation.amountTotal / 100).toFixed(2) : '',
      reservation.createdAt,
      reservation.updatedAt,
      reservation.adminNotes,
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
  const filename = `wakala-reservations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}

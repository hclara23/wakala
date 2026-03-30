import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import ThankYouAnalytics from '@/components/ThankYouAnalytics';
import {
  formatReservationReference,
  getReservation,
  getReservationPaymentStatusLabel,
  getReservationStatusLabel,
} from '@/lib/reservations';
import { site } from '@/lib/site-data';
import { formatCurrency, getStripe } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your reservation or request has been received by Wakala.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type ThankYouPageProps = {
  searchParams: Promise<{
    session_id?: string;
    reservation_id?: string;
  }>;
};

async function getReservationSummary(sessionId?: string, reservationId?: string) {
  const reservation = reservationId ? await getReservation(reservationId) : null;

  if (!sessionId) {
    if (!reservation) {
      return null;
    }

    return {
      reservationId: reservation.id,
      reservationStatus: getReservationStatusLabel(reservation.status),
      paymentStatus: getReservationPaymentStatusLabel(reservation.paymentStatus),
      customerName: reservation.customerName,
      customerEmail: reservation.email,
      serviceAddress: reservation.serviceAddress,
      preferredDate: reservation.preferredDate,
      amountTotal: formatCurrency(reservation.amountTotal, reservation.currency || 'usd'),
      amountTotalCents: reservation.amountTotal,
      currency: reservation.currency || 'usd',
      itemName: reservation.itemName,
      scheduledDate: reservation.scheduledDate,
      scheduledWindow: reservation.scheduledWindow,
    };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata ?? {};
    const resolvedReservationId =
      reservation?.id ||
      (typeof metadata.reservationId === 'string' ? metadata.reservationId.trim().toLowerCase() : '');
    const persistedReservation =
      reservation || (resolvedReservationId ? await getReservation(resolvedReservationId) : null);

    return {
      reservationId: resolvedReservationId || null,
      reservationStatus: persistedReservation
        ? getReservationStatusLabel(persistedReservation.status)
        : session.payment_status === 'paid'
          ? 'Pending schedule review'
          : 'Awaiting payment',
      customerName:
        persistedReservation?.customerName ||
        session.customer_details?.name ||
        metadata.customerName ||
        null,
      customerEmail:
        persistedReservation?.email || session.customer_details?.email || metadata.email || null,
      serviceAddress: persistedReservation?.serviceAddress || metadata.serviceAddress || null,
      preferredDate: persistedReservation?.preferredDate || metadata.preferredDate || null,
      amountTotal: formatCurrency(session.amount_total, session.currency || 'usd'),
      amountTotalCents: session.amount_total ?? persistedReservation?.amountTotal ?? null,
      currency: session.currency || persistedReservation?.currency || 'usd',
      itemName: persistedReservation?.itemName || '15-Yard Dumpster Rental (Full Payment)',
      paymentStatus: persistedReservation
        ? getReservationPaymentStatusLabel(persistedReservation.paymentStatus)
        : session.payment_status === 'paid'
          ? 'Paid'
          : 'Unpaid',
      scheduledDate: persistedReservation?.scheduledDate || null,
      scheduledWindow: persistedReservation?.scheduledWindow || null,
    };
  } catch (error) {
    console.error('Unable to load Stripe session for thank-you page:', error);

    if (!reservation) {
      return null;
    }

    return {
      reservationId: reservation.id,
      reservationStatus: getReservationStatusLabel(reservation.status),
      paymentStatus: getReservationPaymentStatusLabel(reservation.paymentStatus),
      customerName: reservation.customerName,
      customerEmail: reservation.email,
      serviceAddress: reservation.serviceAddress,
      preferredDate: reservation.preferredDate,
      amountTotal: formatCurrency(reservation.amountTotal, reservation.currency || 'usd'),
      amountTotalCents: reservation.amountTotal,
      currency: reservation.currency || 'usd',
      itemName: reservation.itemName,
      scheduledDate: reservation.scheduledDate,
      scheduledWindow: reservation.scheduledWindow,
    };
  }
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { session_id: sessionId, reservation_id: reservationId } = await searchParams;
  const summary = await getReservationSummary(sessionId, reservationId);
  const isPaid = summary?.paymentStatus === 'Paid';

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <ThankYouAnalytics
        currency={(summary?.currency || 'usd').toUpperCase()}
        isPaid={Boolean(isPaid)}
        itemName={summary?.itemName || '15-Yard Dumpster Rental (Full Payment)'}
        reservationId={summary?.reservationId || null}
        transactionId={sessionId || summary?.reservationId || null}
        value={
          typeof summary?.amountTotalCents === 'number' ? summary.amountTotalCents / 100 : null
        }
      />
      <section className="panel rounded-[2rem] p-8 text-center md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/10">
          <CheckCircle2 className="h-8 w-8 text-amber-300" />
        </div>
        <p className="section-kicker mt-6">Thank You</p>
        <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">
          {isPaid ? 'Reservation payment received.' : 'Reservation request received.'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-300">
          {isPaid
            ? 'Stripe confirmed the payment, your reservation is saved, and Wakala can now confirm the delivery window from the scheduling dashboard.'
            : 'Wakala saved the reservation request. If payment did not complete, contact the team directly and we can help finish scheduling.'}
        </p>

        {summary ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[1.75rem] border border-white/10 bg-black/35 p-6 text-left">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Reservation Summary</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Reference</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.reservationId
                    ? formatReservationReference(summary.reservationId)
                    : 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Booking Status</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.reservationStatus || 'Pending review'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Customer</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.customerName || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Email</p>
                <p className="mt-2 break-all text-sm leading-7 text-stone-200">
                  {summary.customerEmail || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Service Address</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.serviceAddress || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Preferred Date</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.preferredDate || 'To be confirmed'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Amount</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.amountTotal || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Payment Status</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.paymentStatus || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Scheduled Date</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.scheduledDate || 'Pending confirmation'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Delivery Window</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {summary.scheduledWindow || 'Pending confirmation'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${site.phone}`}
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            {site.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            {site.email}
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-amber-300/40 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Back home
          </Link>
        </div>
      </section>
    </div>
  );
}

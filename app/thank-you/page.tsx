import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
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
  }>;
};

async function getReservationSummary(sessionId?: string) {
  if (!sessionId) {
    return null;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata ?? {};

    return {
      customerName: session.customer_details?.name || metadata.customerName || null,
      customerEmail: session.customer_details?.email || metadata.email || null,
      serviceAddress: metadata.serviceAddress || null,
      preferredDate: metadata.preferredDate || null,
      amountTotal: formatCurrency(session.amount_total, session.currency || 'usd'),
      paymentStatus: session.payment_status,
    };
  } catch (error) {
    console.error('Unable to load Stripe session for thank-you page:', error);
    return null;
  }
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { session_id: sessionId } = await searchParams;
  const summary = await getReservationSummary(sessionId);
  const isPaid = summary?.paymentStatus === 'paid';

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
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
            ? 'Stripe confirmed the payment and Wakala can now review the reservation details.'
            : 'Wakala received the reservation details. If payment did not complete, contact the team directly and we can help finish scheduling.'}
        </p>

        {summary ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[1.75rem] border border-white/10 bg-black/35 p-6 text-left">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Reservation Summary</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Checkout Canceled',
  description: 'Your Wakala checkout was canceled before payment completion.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutCanceledPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <section className="panel rounded-[2rem] p-8 text-center md:p-12">
        <p className="section-kicker">Checkout Canceled</p>
        <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">
          No payment was completed.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-300">
          If you still want the dumpster reservation, you can return to the homepage and start
          checkout again. For anything that needs a quote first, Wakala can scope it with a call.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/#booking"
            className="inline-flex items-center justify-center border border-amber-300/40 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Return to booking
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Learn more
          </Link>
        </div>
      </section>
    </div>
  );
}

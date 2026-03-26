import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <section className="panel rounded-[2rem] p-8 text-center md:p-12">
        <p className="section-kicker">Page Not Found</p>
        <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">
          That page is not here anymore.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-300">
          Use the main site navigation or jump back to the reservation section if you were trying to
          book a dumpster.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-amber-300/40 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
          >
            Back home
          </Link>
          <Link
            href="/#booking"
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Go to booking
          </Link>
        </div>
      </section>
    </div>
  );
}

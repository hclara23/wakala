import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  companyPrinciples,
  processSteps,
  services,
  site,
} from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'About Wakala',
  description:
    'Learn how Wakala approaches roll-off dumpster rentals, cleanup work, pressure washing, handyman projects, and small remodel support in El Paso.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <section className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
        <div className="space-y-6">
          <p className="section-kicker">About Wakala</p>
          <h1 className="max-w-4xl font-serif text-5xl text-white md:text-7xl">
            A local service company built around the jobs that usually overlap on the same property.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-300">
            Wakala is positioned for the kind of work homeowners, landlords, and contractors often
            need at the same time: hauling, cleanup, exterior washing, repair support, and light
            remodel follow-through. The business model in this repo was already pointing in that
            direction. This page now makes it explicit.
          </p>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10">
          <Image
            src="/gallery/property-refresh.jpg"
            alt="Outdoor property after cleanup and refresh work."
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Serving {site.areaServed}</p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-stone-200">
              Wakala&apos;s strongest positioning is not just one service. It is being the team that can
              move a property from cluttered or unfinished toward clean, usable, and ready.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {companyPrinciples.map((principle) => (
          <article key={principle.title} className="panel rounded-[2rem] p-7">
            <p className="section-kicker">{principle.title}</p>
            <p className="mt-4 text-base leading-8 text-stone-300">{principle.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="panel rounded-[2rem] p-7 md:p-8">
          <p className="section-kicker">How Jobs Move</p>
          <h2 className="mt-4 font-serif text-4xl text-white">
            Simple process, quote-first where scope can change.
          </h2>
          <div className="mt-8 space-y-5">
            {processSteps.map((step) => (
              <div key={step.title} className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="section-kicker">Service Snapshot</p>
            <h2 className="font-serif text-4xl text-white">
              The service lineup is now reflected consistently across the site.
            </h2>
          </div>
          <div className="grid gap-4">
            {services.map((service) => (
              <article key={service.slug} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{service.eyebrow}</p>
                  <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-300">{service.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 panel rounded-[2rem] p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-4">
            <p className="section-kicker">Reserve A Dumpster</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              Checkout is now scoped to the kind of purchase that should actually be paid online.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-300">
              Rather than letting the browser send arbitrary service names and prices, the app now
              uses a server-managed Stripe configuration with validated reservation details and a
              cleaner success flow for the 15-yard dumpster offer.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Checkout-ready</p>
            <h3 className="mt-3 font-serif text-3xl text-white">15-yard dumpster reservation</h3>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              The reservation flow now starts with customer and delivery details before card payment.
            </p>
            <Link
              href="/#booking"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
            >
              Start secure reservation
            </Link>
            <Link
              href="/gallery"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-stone-300 transition hover:text-white"
            >
              See recent work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

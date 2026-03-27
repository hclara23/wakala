import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import ReservationCheckoutForm from '@/components/ReservationCheckoutForm';
import {
  checkoutItems,
  companyPrinciples,
  featuredBlogPosts,
  featuredGalleryImages,
  services,
  site,
} from '@/lib/site-data';

const paymentItem = checkoutItems.dumpster_15_reservation;

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Wakala service truck and equipment prepared for property work."
            fill
            priority
            className="object-cover object-center opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,182,118,0.22),transparent_32%),linear-gradient(180deg,rgba(7,7,7,0.45),rgba(7,7,7,0.95))]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-24">
          <div className="max-w-3xl space-y-8">
            <p className="section-kicker">El Paso Property Services</p>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-serif text-6xl leading-none text-white md:text-8xl">
                Roll-offs, cleanup, and property-ready work without the lag.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-300 md:text-xl">
                {site.tagline}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/#booking"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black transition hover:bg-amber-200 sm:w-auto"
              >
                Start dumpster reservation
              </Link>
              <a
                href={`tel:${site.phone}`}
                className="inline-flex items-center justify-center gap-2 border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white/50 hover:bg-white/5"
              >
                <Phone className="h-4 w-4" />
                {site.quoteLabel}
              </a>
            </div>

            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              <div className="panel rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Secure booking</p>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Direct, fixed-price reservations protected by industry-standard encryption.
                </p>
              </div>
              <div className="panel rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Service range</p>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Roll-offs, pressure washing, hauling, handyman repairs, and property refresunts.
                </p>
              </div>
              <div className="panel rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Local expertise</p>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Serving homeowners, landlords, and contractors across {site.areaServed}.
                </p>
              </div>
            </div>
          </div>

          <div className="panel rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-200">
                Booking Information
              </p>
            </div>
            <div className="mt-6 space-y-5 text-sm leading-7 text-stone-300">
              <p>
                Wakala offers both direct online booking and quote-based scheduling to fit your project. 
                Our 15-yard dumpster rentals can be reserved instantly at a fixed price, ensuring 
                standardized rates for your cleanup.
              </p>
              <p>
                For pressure washing, handyman repairs, and specialized cleanups, we provide custom 
                estimates to match the specific scope and timing your property requires.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3 text-sm text-stone-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                Reservations are secured before scheduling is finalized for your convenience.
              </div>
              <div className="flex items-start gap-3 text-sm text-stone-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                All payments are processed securely through Stripe for your peace of mind.
              </div>
              <div className="flex items-start gap-3 text-sm text-stone-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                View real examples of our recent property service work in the project gallery.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="section-kicker">Wakala Services</p>
            <h2 className="font-serif text-4xl text-white md:text-6xl">
              Professional property care, cleanup, and maintenance.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-300 md:text-base">
            From heavy-duty hauling to detailed repair work, we handle the tasks that keep 
            residential and commercial properties in El Paso functional and looking their best.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.slug} className="panel grid overflow-hidden rounded-[2rem] md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-72">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-stone-200">
                  {service.eyebrow}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-8 p-7 md:p-8">
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif text-3xl text-white">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-300 md:text-base">
                      {service.description}
                    </p>
                  </div>

                  <ul className="grid gap-3 text-sm text-stone-200">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4 text-amber-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {service.checkoutItemId ? (
                    <Link
                      href="/#booking"
                      className="inline-flex items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
                    >
                      Start reservation
                    </Link>
                  ) : (
                    <a
                      href={`tel:${site.phone}`}
                      className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
                    >
                      {service.ctaLabel}
                    </a>
                  )}
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-stone-300 transition hover:text-white"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="space-y-5">
            <p className="section-kicker">About The Business</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              A practical local service company, not a one-service landing page pretending to do everything.
            </h2>
            <p className="max-w-xl text-base leading-8 text-stone-300">
              Wakala provides dependable property support, fast coordination, and visible 
              before-and-after value for homeowners and businesses in El Paso.
            </p>
            <div className="grid gap-4 pt-2">
              {companyPrinciples.map((principle) => (
                <div key={principle.title} className="rounded-3xl border border-white/10 bg-black/40 p-5">
                  <h3 className="text-lg font-semibold text-white">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-300">{principle.description}</p>
                </div>
              ))}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 transition hover:text-amber-200"
            >
              Visit the about page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/10">
            <Image
              src="/gallery/crew-at-work.jpg"
              alt="Wakala team working on site."
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Our Approach</p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-stone-200">
                We focus on professional execution and clear communication, ensuring every 
                property is left ready for its next phase of use or renovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="section-kicker">Project Gallery</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              Real work from local properties across El Paso.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-stone-300 transition hover:text-white"
          >
            View all images
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredGalleryImages.slice(0, 4).map((image, index) => (
            <article
              key={image.title}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/10 ${
                index === 0 ? 'xl:col-span-2' : ''
              }`}
            >
              <div className="relative min-h-80">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1280px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{image.category}</p>
                <h3 className="mt-2 text-lg text-white">{image.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <p className="section-kicker">Wakala Blog</p>
              <h2 className="max-w-4xl font-serif text-4xl text-white md:text-5xl">
                Practical advice for dumpster rentals, property maintenance, 
                and repair work in the local El Paso area.
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-stone-300 transition hover:text-white"
            >
              Read the blog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredBlogPosts.map((post) => (
              <article key={post.slug} className="panel overflow-hidden rounded-[2rem]">
                <div className="relative min-h-64">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.28em] text-stone-400">
                    <span>{post.tags[0]}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="font-serif text-2xl text-white">{post.title}</h3>
                  <p className="text-sm leading-7 text-stone-300">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 transition hover:text-amber-200"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="panel grid gap-8 rounded-[2rem] p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div className="space-y-5">
            <p className="section-kicker">Start Your Project</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              Easy dumpster reservations and fast service quotes.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-300">
              Submit your details through our secure form to reserve select services instantly, 
              or reach out for a custom quote on washing and repair projects. We ensure a 
              straightforward process from first contact to project completion.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/45 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Secure reservation</p>
            <h3 className="mt-3 font-serif text-3xl text-white">15-yard dumpster reservation</h3>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Confirm the jobsite details here, then complete your payment securely. Wakala follows
              up after payment to finalize scheduling and placement.
            </p>
            <ReservationCheckoutForm
              itemId={paymentItem.id}
              itemLabel={paymentItem.reservationLabel}
              buttonLabel={paymentItem.buttonLabel}
              className="mt-6"
            />
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Quote-based work</p>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Pressure washing, handyman jobs, yard cleanups, trailer rentals, and remodels are
                best scheduled after a quick scope conversation.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
                  Email Wakala
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type GalleryImage, site } from '@/lib/site-data';

type GalleryExperienceProps = {
  images: GalleryImage[];
};

export default function GalleryExperience({ images }: GalleryExperienceProps) {
  const reduceMotion = useReducedMotion();
  const serviceImages = useMemo(
    () => images.filter((image) => image.category !== 'Before' && image.category !== 'After'),
    [images]
  );
  const beforeAfter = useMemo(
    () => images.filter((image) => image.category === 'Before' || image.category === 'After'),
    [images]
  );
  const categories = useMemo(
    () => ['All', ...new Set(serviceImages.map((image) => image.category))],
    [serviceImages]
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredImages = useMemo(() => {
    if (activeCategory === 'All') {
      return serviceImages;
    }

    return serviceImages.filter((image) => image.category === activeCategory);
  }, [activeCategory, serviceImages]);

  return (
    <div className="space-y-14">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <p className="section-kicker">Project Gallery</p>
          <h2 className="font-serif text-4xl text-white md:text-5xl">
            Explore recent property work handled by the Wakala crew.
          </h2>
          <p className="text-base leading-8 text-stone-300">
            View real examples of our dumpster rentals, pressure washing, yard cleanups, and 
            property repairs across El Paso. Each project reflects our focus on fast execution
            and professional site care.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] transition',
                  isActive
                    ? 'border-amber-300/40 bg-amber-300 text-black'
                    : 'border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/30 hover:text-white'
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid auto-rows-[19rem] gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.article
              key={image.title}
              layout
              initial={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -8 }}
              className={cn(
                'group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35',
                index % 5 === 0 ? 'md:row-span-2' : '',
                index % 4 === 3 ? 'xl:col-span-2' : ''
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.05),rgba(4,4,4,0.82))]" />
              <div className="absolute inset-x-0 bottom-0 space-y-4 p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-stone-200/85">
                  <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1">
                    {image.category}
                  </span>
                  <span className="text-amber-300/85">{image.serviceLine}</span>
                </div>
                <div className="max-w-xl space-y-3">
                  <h3 className="font-serif text-2xl text-white md:text-3xl">{image.title}</h3>
                  <p className="max-w-lg text-sm leading-7 text-stone-200/90">{image.summary}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {beforeAfter.length === 2 ? (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <p className="section-kicker">Before / After</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              The point is not just removal. It is visible control.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-300">
              A simple before-and-after sequence often says more than a generic promise. It shows
              the difference between overflow and a reset that feels calm, usable, and ready for
              the next trade, tenant, or owner.
            </p>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Book The Next Step</p>
              <a
                href={`tel:${site.phone}`}
                className="mt-4 inline-flex items-center gap-2 font-serif text-3xl text-white transition hover:text-amber-200"
              >
                <Phone className="h-5 w-5 text-amber-300" />
                {site.phoneDisplay}
              </a>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                Call for yard cleanup, haul-out, washing, or handyman scope. If the site needs a
                container first, the reservation flow is ready on the home page.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#booking"
                  className="inline-flex items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
                >
                  Reserve a dumpster
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Read service articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {beforeAfter.map((image) => (
              <motion.article
                key={image.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ amount: 0.3, once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="panel overflow-hidden rounded-[2rem]"
              >
                <div className="relative min-h-[23rem]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{image.category}</p>
                    <h3 className="mt-2 font-serif text-3xl text-white">{image.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-200">{image.summary}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

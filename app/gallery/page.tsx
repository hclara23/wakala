import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import GalleryExperience from '@/components/GalleryExperience';
import { AmbientOrbs, Reveal } from '@/components/PageMotion';
import { getSiteImageSrc } from '@/lib/site-images';
import { galleryImages, site } from '@/lib/site-data';

const heroImage = galleryImages[0];
const galleryMetadataImage = heroImage ? getSiteImageSrc(heroImage.src) : site.ogImage;

export const metadata: Metadata = {
  title: 'Project Gallery',
  description:
    'Browse Wakala project imagery for pressure washing, yard cleanup, haul-out, junk removal, and small repair work across El Paso properties.',
  keywords: [
    'El Paso project gallery',
    'pressure washing gallery El Paso',
    'yard cleanup photos El Paso',
    'junk removal images El Paso',
  ],
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Wakala Project Gallery | El Paso Property Services',
    description:
      'A modern gallery of real Wakala project imagery covering property reset, washing, haul-out, and repair support in El Paso.',
    url: `${site.url}/gallery`,
    images: [
      {
        url: galleryMetadataImage,
        alt: heroImage?.alt ?? `${site.name} gallery preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wakala Project Gallery | El Paso Property Services',
    description:
      'Browse real project imagery for cleanup, washing, haul-out, and repair work across El Paso.',
    images: [galleryMetadataImage],
  },
};

export default function GalleryPage() {
  const serviceCategories = [...new Set(galleryImages.map((image) => image.category))];
  const serviceStoryCount = new Set(
    galleryImages
      .filter((image) => image.category !== 'Before' && image.category !== 'After')
      .map((image) => image.category)
  ).size;

  return (
    <div className="pb-20 md:pb-24">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,182,118,0.2),transparent_30%),linear-gradient(180deg,rgba(7,7,7,0.42),rgba(7,7,7,0.95))]" />
        </div>
        <AmbientOrbs />

        <div className="relative mx-auto max-w-7xl px-6 py-18 md:py-24">
          <div className="grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <Reveal className="space-y-7">
              <p className="section-kicker">Project Gallery</p>
              <h1 className="max-w-5xl font-serif text-5xl text-white md:text-7xl">
                Real field images, organized like a proper visual proof-of-work page.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-stone-300">
                The gallery now leans on the local asset library in this repo instead of generic
                placeholders. It is structured around the actual jobs Wakala sells most often, with
                before-and-after context and service-level grouping built in.
              </p>

              <div className="mask-fade overflow-hidden">
                <div className="marquee-track">
                  {serviceCategories.concat(serviceCategories).map((category, index) => (
                    <span
                      key={`${category}-${index}`}
                      className="mr-3 inline-flex rounded-full border border-white/12 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.26em] text-stone-200"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="panel rounded-[2rem] p-7 md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Gallery Stats</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">{galleryImages.length}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">Local asset images</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">{serviceStoryCount}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">Service stories</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">1</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">Before / after pair</p>
                  </div>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                  <p className="text-sm leading-7 text-stone-300">
                    This page is meant to answer a simple question quickly: does the company look
                    like it does this type of work in the field? Now it does.
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`tel:${site.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/35 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phoneDisplay}
                  </a>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/5"
                  >
                    Read the blog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-20">
        <GalleryExperience images={galleryImages} />
      </div>
    </div>
  );
}

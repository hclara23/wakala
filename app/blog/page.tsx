import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AmbientOrbs, Reveal, Stagger, StaggerItem } from '@/components/PageMotion';
import { getSiteImageSrc } from '@/lib/site-images';
import { blogPosts, site } from '@/lib/site-data';

const featuredPost = blogPosts[0];

const metadataImage = featuredPost ? getSiteImageSrc(featuredPost.coverImage) : site.ogImage;

export const metadata: Metadata = {
  title: 'El Paso Property Services Blog',
  description:
    'Read Wakala articles covering El Paso dumpster rentals, pressure washing timing, yard cleanup planning, and handyman upgrades for faster property turnover.',
  keywords: [
    'El Paso dumpster rental blog',
    'El Paso pressure washing tips',
    'yard cleanup El Paso guide',
    'handyman article El Paso',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'El Paso Property Services Blog | Wakala',
    description:
      'Helpful articles on dumpster rentals, pressure washing, yard cleanups, and handyman work in El Paso.',
    url: `${site.url}/blog`,
    images: [
      {
        url: metadataImage,
        alt: featuredPost?.coverAlt ?? `${site.name} service article preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Paso Property Services Blog | Wakala',
    description:
      'Local articles covering dumpster rentals, pressure washing, yard cleanup, and handyman work in El Paso.',
    images: [metadataImage],
  },
};

export default function BlogIndexPage() {
  if (!featuredPost) {
    return null;
  }

  const keywordRail = [...new Set(blogPosts.flatMap((post) => post.keywords))].slice(0, 8);
  const tagRail = [...new Set(blogPosts.flatMap((post) => post.tags))];
  const supportingPosts = blogPosts.slice(1);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${site.name} Blog`,
    description: metadata.description,
    url: `${site.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}${site.logo}`,
      },
    },
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: `${site.url}/blog/${post.slug}`,
      image: `${site.url}${getSiteImageSrc(post.coverImage)}`,
    })),
  };

  return (
    <div className="pb-20 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={featuredPost.coverImage}
            alt={featuredPost.coverAlt}
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,182,118,0.22),transparent_32%),linear-gradient(180deg,rgba(7,7,7,0.4),rgba(7,7,7,0.92))]" />
        </div>
        <AmbientOrbs />

        <div className="relative mx-auto max-w-7xl px-6 py-18 md:py-24">
          <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <Reveal className="space-y-7">
            <p className="section-kicker">Field Notes & Property Tips</p>
            <h1 className="max-w-5xl font-serif text-5xl text-white md:text-7xl">
              Expert advice for maintaining and upgrading El Paso properties.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-stone-300">
              From dumpster rental guides to pressure washing timing, our blog provides practical 
              insights to help homeowners, landlords, and contractors keep their projects 
              moving forward cleanly.
            </p>

              <div className="flex flex-wrap gap-3">
                {tagRail.map((tag, index) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.26em] text-stone-200"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="panel rounded-[2rem] p-7 md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Service Highlights</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">{blogPosts.length}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">Expert articles</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">4</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">Service categories</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                    <p className="text-3xl font-serif text-white">Local</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">El Paso expertise</p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-7 text-stone-300">
                  Each article is written to provide practical advice for your next project, 
                  helping you make informed decisions about your property maintenance.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {keywordRail.concat(keywordRail).map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-20">
        <Reveal>
          <section className="panel overflow-hidden rounded-[2rem]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[24rem]">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.coverAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              </div>

              <div className="space-y-5 p-8 md:p-10">
                <p className="section-kicker">Featured Article</p>
                <div className="flex flex-wrap gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-stone-400">
                  <span>{featuredPost.readingTime}</span>
                  <span>{featuredPost.tags.join(' / ')}</span>
                </div>
                <h2 className="font-serif text-4xl text-white md:text-5xl">{featuredPost.title}</h2>
                <p className="text-base leading-8 text-stone-300">{featuredPost.excerpt}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {featuredPost.takeaways.map((takeaway) => (
                    <div key={takeaway} className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <p className="mt-3 text-sm leading-7 text-stone-200">{takeaway}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 transition hover:text-amber-200"
                >
                  Read featured article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mt-16">
          <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <p className="section-kicker">Wakala Blog</p>
              <h2 className="font-serif text-4xl text-white md:text-5xl">
                Practical guides for your property projects.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
              We share our field experience to help you plan your next cleanup, 
              renovation, or property reset with confidence.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-6 xl:grid-cols-2">
            {supportingPosts.map((post, index) => (
              <StaggerItem key={post.slug}>
                <article className="panel h-full overflow-hidden rounded-[2rem]">
                  <div className="grid h-full gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
                      <div className="relative min-h-72">
                        <Image
                          src={post.coverImage}
                          alt={post.coverAlt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1280px) 100vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-6 p-7 md:p-8">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-stone-400">
                          <span>{post.tags[0]}</span>
                          <span>{post.readingTime}</span>
                        </div>
                        <h3 className="font-serif text-3xl text-white">{post.title}</h3>
                        <p className="text-sm leading-7 text-stone-300">{post.excerpt}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {post.keywords.slice(0, 3).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-white/10 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-stone-300"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 transition hover:text-amber-200"
                      >
                        Read article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <Reveal delay={0.08} className="mt-16">
          <section className="panel rounded-[2rem] p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="space-y-4">
                <p className="section-kicker">Contact Us</p>
                <h2 className="font-serif text-4xl text-white md:text-5xl">
                  Ready to start your next project?
                </h2>
                <p className="max-w-2xl text-base leading-8 text-stone-300">
                  Browse our gallery for inspiration, then reach out for a custom quote or 
                  reserve a dumpster directly online to get your project moving.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/gallery"
                  className="rounded-[1.75rem] border border-white/10 bg-black/35 p-6 transition hover:border-white/25 hover:bg-white/[0.05]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">See the work</p>
                  <h3 className="mt-3 font-serif text-3xl text-white">Visit the gallery</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    Review cleanup, washing, haul-out, and repair imagery from our recent local projects.
                  </p>
                </Link>
                <Link
                  href="/#booking"
                  className="rounded-[1.75rem] border border-amber-300/25 bg-amber-300/10 p-6 transition hover:border-amber-300/40 hover:bg-amber-300/15"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-200">Ready to book</p>
                  <h3 className="mt-3 font-serif text-3xl text-white">Reserve a dumpster</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-200/90">
                    Book your 15-yard dumpster instantly and securely through our online reservation flow.
                  </p>
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

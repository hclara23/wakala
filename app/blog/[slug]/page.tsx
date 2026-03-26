import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/PageMotion';
import { getSiteImageSrc } from '@/lib/site-images';
import { blogPosts, getBlogPost, site } from '@/lib/site-data';

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPublishedDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function toAnchorId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const coverImageSrc = getSiteImageSrc(post.coverImage);

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${site.url}/blog/${post.slug}`,
      images: [
        {
          url: coverImageSrc,
          alt: post.coverAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [coverImageSrc],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const coverImageSrc = getSiteImageSrc(post.coverImage);
  const sectionAnchors = post.sections.map((section) => ({
    id: toAnchorId(section.heading),
    heading: section.heading,
  }));
  const relatedPosts = blogPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 2);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${site.url}${coverImageSrc}`,
    datePublished: post.publishedAt,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}${site.logo}`,
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: site.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${site.url}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${site.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="pb-20 md:pb-24">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.35),rgba(4,4,4,0.82))]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <Reveal className="max-w-4xl space-y-7">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-stone-300 transition hover:text-white"
            >
              Back to blog
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>

            <div className="flex flex-wrap gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-amber-300/85">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/12 bg-black/35 px-4 py-2">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-5xl text-white md:text-7xl">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm uppercase tracking-[0.24em] text-stone-400">
              <span>{formatPublishedDate(post.publishedAt)}</span>
              <span>{post.readingTime}</span>
              <span>El Paso property services</span>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-stone-300">{post.excerpt}</p>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, faqSchema, breadcrumbSchema]),
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="grid gap-10 xl:grid-cols-[0.72fr_0.28fr]">
          <div className="space-y-10">
            <Reveal>
              <section className="panel rounded-[2rem] p-7 md:p-8">
                <p className="section-kicker">Why This Matters</p>
                <p className="mt-5 text-base leading-8 text-stone-300">{post.description}</p>
              </section>
            </Reveal>

            <Reveal delay={0.04}>
              <section className="panel rounded-[2rem] p-7 md:p-8">
                <p className="section-kicker">Key Takeaways</p>
                <ul className="rich-text mt-6 space-y-4">
                  {post.takeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </Reveal>

            {post.sections.map((section, index) => (
              <Reveal key={section.heading} delay={0.04 + index * 0.03}>
                <section id={toAnchorId(section.heading)} className="panel rounded-[2rem] p-7 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-amber-300">
                      Section {index + 1}
                    </span>
                    <h2 className="font-serif text-3xl text-white md:text-4xl">{section.heading}</h2>
                  </div>
                  <div className="rich-text mt-5 space-y-5">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.list ? (
                      <ul className="space-y-3">
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              </Reveal>
            ))}

            <Reveal delay={0.1}>
              <section className="panel rounded-[2rem] p-7 md:p-8">
                <p className="section-kicker">Frequently Asked Questions</p>
                <div className="mt-6 space-y-4">
                  {post.faq.map((item) => (
                    <div key={item.question} className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                      <h2 className="text-xl font-semibold text-white">{item.question}</h2>
                      <p className="mt-2 text-sm leading-7 text-stone-300">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {relatedPosts.length ? (
              <Reveal delay={0.12}>
                <section className="space-y-6">
                  <div className="space-y-3">
                    <p className="section-kicker">Keep Reading</p>
                    <h2 className="font-serif text-4xl text-white">Related service articles</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {relatedPosts.map((relatedPost) => (
                      <article key={relatedPost.slug} className="panel overflow-hidden rounded-[2rem]">
                        <div className="relative min-h-64">
                          <Image
                            src={relatedPost.coverImage}
                            alt={relatedPost.coverAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                        <div className="space-y-4 p-6">
                          <div className="flex flex-wrap gap-3 text-[0.68rem] uppercase tracking-[0.26em] text-stone-400">
                            <span>{relatedPost.tags[0]}</span>
                            <span>{relatedPost.readingTime}</span>
                          </div>
                          <h3 className="font-serif text-2xl text-white">{relatedPost.title}</h3>
                          <p className="text-sm leading-7 text-stone-300">{relatedPost.excerpt}</p>
                          <Link
                            href={`/blog/${relatedPost.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 transition hover:text-amber-200"
                          >
                            Read article
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </Reveal>
            ) : null}
          </div>

          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <Reveal delay={0.04}>
              <aside className="panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Article Guide</p>
                <div className="mt-5 space-y-3 text-sm leading-7 text-stone-300">
                  <p>
                    <span className="text-stone-100">Published:</span> {formatPublishedDate(post.publishedAt)}
                  </p>
                  <p>
                    <span className="text-stone-100">Reading time:</span> {post.readingTime}
                  </p>
                  <p>
                    <span className="text-stone-100">Focus:</span> {post.tags.join(', ')}
                  </p>
                </div>
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Jump To</p>
                  <div className="mt-4 space-y-3">
                    {sectionAnchors.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-200 transition hover:border-white/25 hover:text-white"
                      >
                        {section.heading}
                      </a>
                    ))}
                  </div>
                </div>
              </aside>
            </Reveal>

            <Reveal delay={0.08}>
              <aside className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-200">Need Actual Help?</p>
                <h2 className="mt-4 font-serif text-3xl text-white">Turn the article into a real job plan.</h2>
                <p className="mt-4 text-sm leading-7 text-stone-200/90">
                  Share the address, timeline, and service type. Wakala can move from cleanup and
                  hauling to washing or repair support without turning the property into a multi-vendor scramble.
                </p>
                <div className="mt-6 space-y-3">
                  <a
                    href={`tel:${site.phone}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/35 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phoneDisplay}
                  </a>
                  <Link
                    href="/#booking"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/5"
                  >
                    Reserve a dumpster
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </Reveal>

            <Reveal delay={0.12}>
              <aside className="panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Keyword Signals</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/10 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-stone-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    These terms now map to actual published pages, structured data, and internal
                    routing back to the booking and gallery experiences.
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  );
}

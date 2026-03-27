'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { reviews } from '@/lib/site-data';

export default function Testimonials() {
  return (
    <section className="border-t border-white/5 bg-black/20 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <p className="section-kicker">Social Proof</p>
          <h2 className="mt-4 font-serif text-4xl text-white md:text-5xl">
            Trusted by El Paso property owners.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-400">
            Real feedback from recent projects. We focus on being the team you actually 
            enjoy having on your property.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review, index) => (
            <motion.article
              key={review.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-amber-300/20 hover:bg-white/[0.04]"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-300 text-amber-300"
                    />
                  ))}
                </div>
                <p className="text-[0.95rem] leading-7 text-stone-300 italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5">
                <div>
                  <p className="text-sm font-semibold text-white">{review.author}</p>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-wider text-stone-500">
                    Verified Customer
                  </p>
                </div>
                <span className="text-[0.65rem] uppercase tracking-widest text-stone-600">
                  {review.date}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="https://share.google/6ey4dQjp4MJ5h2FYU"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80 transition hover:text-amber-200"
          >
            Read all Google Reviews
            <Star className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
}

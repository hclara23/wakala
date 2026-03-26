import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { navigation, site } from '@/lib/site-data';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300/80">
            {site.shortName}
          </p>
          <h2 className="max-w-lg font-serif text-3xl text-white md:text-4xl">
            Property services that keep cleanup, hauling, and repair work moving.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-stone-300">{site.description}</p>
          <a
            href={site.googleBusinessUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-stone-200 transition hover:text-white"
          >
            View Google Business profile
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-200">
            Explore
          </h3>
          <div className="space-y-3 text-sm text-stone-300">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="block transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 text-sm text-stone-400">
            <Link href="/terms" className="block transition hover:text-white">
              Terms & Reservation Policy
            </Link>
            <Link href="/privacy" className="mt-3 block transition hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-200">
            Contact
          </h3>
          <div className="space-y-3 text-sm text-stone-300">
            <a href={`tel:${site.phone}`} className="inline-flex items-center gap-2 transition hover:text-white">
              <Phone className="h-4 w-4" />
              {site.phoneDisplay}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2 break-all transition hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {site.email}
            </a>
            <p>Serving {site.areaServed}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs uppercase tracking-[0.35em] text-stone-500">
        (c) {new Date().getFullYear()} {site.name}
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { navigation, site } from '@/lib/site-data';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300/80">
            {site.shortName}
          </span>
          <span className="hidden text-sm text-stone-300 md:inline">
            Roll-Offs, Cleanup, and Property Services
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-300 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 text-sm text-stone-300 lg:flex">
          <a
            href={`tel:${site.phone}`}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Phone className="h-4 w-4" />
            {site.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
            {site.email}
          </a>
        </div>
      </div>

      <nav className="scrollbar-none flex gap-5 overflow-x-auto px-6 pb-4 text-sm text-stone-300 md:hidden">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

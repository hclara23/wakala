import Link from 'next/link';
import { cn } from '@/lib/utils';

type AdminNavigationProps = {
  current: 'leads' | 'reservations';
};

const items = [
  {
    href: '/admin/leads',
    id: 'leads',
    label: 'Lead inbox',
  },
  {
    href: '/admin/reservations',
    id: 'reservations',
    label: 'Reservations',
  },
] as const;

export default function AdminNavigation({ current }: AdminNavigationProps) {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            'inline-flex items-center justify-center border px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] transition',
            current === item.id
              ? 'border-amber-300/40 bg-amber-300 text-black hover:bg-amber-200'
              : 'border-white/15 text-white hover:border-white/50 hover:bg-white/5'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

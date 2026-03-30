import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loginAction } from '@/app/admin/actions';
import { getAdminEmail, hasAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case 'invalid-credentials':
      return 'The admin email or password was incorrect.';
    case 'missing-config':
      return 'Add ADMIN_RESERVATIONS_EMAIL and ADMIN_RESERVATIONS_PASSWORD to your environment before using the dashboard.';
    default:
      return null;
  }
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await hasAdminSession()) {
    redirect('/admin/reservations');
  }

  const configured = isAdminAuthConfigured();
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <section className="panel rounded-[2rem] p-8 md:p-12">
        <p className="section-kicker">Admin</p>
        <h1 className="mt-4 font-serif text-5xl text-white md:text-6xl">
          Reservation dashboard login
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300">
          Review paid reservations, confirm delivery windows, and keep internal scheduling notes in
          one place.
        </p>

        {!configured ? (
          <div className="mt-8 rounded-[1.5rem] border border-amber-300/25 bg-amber-300/8 p-5 text-sm leading-7 text-stone-200">
            Add <code>ADMIN_RESERVATIONS_EMAIL</code> and <code>ADMIN_RESERVATIONS_PASSWORD</code>{' '}
            to <code>.env.local</code> before using this page.
          </div>
        ) : (
          <form action={loginAction} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300"
                htmlFor="email"
              >
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={getAdminEmail()}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
                placeholder="Enter the dashboard email"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300"
                htmlFor="password"
              >
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
                placeholder="Enter the dashboard password"
              />
            </div>

            {errorMessage ? (
              <p
                className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
            >
              Open dashboard
            </button>
          </form>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
          >
            Back home
          </Link>
        </div>
      </section>
    </div>
  );
}

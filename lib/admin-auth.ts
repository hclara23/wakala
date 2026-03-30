import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'wakala_admin_session';

export function getAdminEmail() {
  return process.env.ADMIN_RESERVATIONS_EMAIL?.trim().toLowerCase() || '';
}

export function getAdminPassword() {
  return process.env.ADMIN_RESERVATIONS_PASSWORD?.trim() || '';
}

function getAdminSessionValue() {
  const email = getAdminEmail();
  const password = getAdminPassword();

  if (!email || !password) {
    return '';
  }

  return createHash('sha256').update(`${email}:${password}`).digest('hex');
}

export function isAdminAuthConfigured() {
  return getAdminEmail().length > 0 && getAdminPassword().length > 0;
}

export async function hasAdminSession() {
  const sessionValue = getAdminSessionValue();

  if (!sessionValue) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === sessionValue;
}

export async function setAdminSession() {
  const sessionValue = getAdminSessionValue();

  if (!sessionValue) {
    throw new Error('ADMIN_RESERVATIONS_EMAIL and ADMIN_RESERVATIONS_PASSWORD are required.');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 0,
  });
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    redirect('/admin');
  }
}

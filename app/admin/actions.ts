'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  clearAdminSession,
  getAdminEmail,
  getAdminPassword,
  isAdminAuthConfigured,
  requireAdminSession,
  setAdminSession,
} from '@/lib/admin-auth';
import {
  reservationStatuses,
  updateReservationByAdmin,
  type ReservationStatus,
} from '@/lib/reservations';

export async function loginAction(formData: FormData) {
  if (!isAdminAuthConfigured()) {
    redirect('/admin?error=missing-config');
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();

  if (email !== getAdminEmail() || password !== getAdminPassword()) {
    redirect('/admin?error=invalid-credentials');
  }

  await setAdminSession();
  redirect('/admin/reservations');
}

export async function logoutAction() {
  await clearAdminSession();
  redirect('/admin');
}

export async function updateReservationAction(formData: FormData) {
  await requireAdminSession();

  const reservationId = String(formData.get('reservationId') || '').trim();
  const status = String(formData.get('status') || '').trim() as ReservationStatus;
  const scheduledDate = String(formData.get('scheduledDate') || '').trim();
  const scheduledWindow = String(formData.get('scheduledWindow') || '').trim();
  const adminNotes = String(formData.get('adminNotes') || '').trim();

  if (!reservationStatuses.includes(status)) {
    redirect('/admin/reservations?error=invalid-status');
  }

  try {
    await updateReservationByAdmin(reservationId, {
      status,
      scheduledDate,
      scheduledWindow,
      adminNotes,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'The reservation could not be updated.';
    redirect(`/admin/reservations?error=${encodeURIComponent(message)}`);
  }

  revalidatePath('/admin/reservations');
}

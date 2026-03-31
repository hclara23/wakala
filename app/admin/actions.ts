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
import { updateAvailabilitySettings } from '@/lib/availability';
import {
  reservationStatuses,
  updateReservationByAdmin,
  type ReservationStatus,
} from '@/lib/reservations';
import {
  convertLeadToJob,
  leadFollowUpStatuses,
  leadPipelineStatuses,
  leadQuoteStatuses,
  leadReviewStatuses,
  updateLeadByAdmin,
  type LeadFollowUpStatus,
  type LeadPipelineStatus,
  type LeadQuoteStatus,
  type LeadReviewStatus,
} from '@/lib/leads';

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
  redirect('/admin/leads');
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
  revalidatePath('/admin/leads');
}

export async function updateAvailabilityAction(formData: FormData) {
  await requireAdminSession();

  const dumpster15NextAvailableDate = String(
    formData.get('dumpster15NextAvailableDate') || ''
  ).trim();
  const dumpster15Note = String(formData.get('dumpster15Note') || '').trim();
  const quoteNextAvailableDate = String(formData.get('quoteNextAvailableDate') || '').trim();
  const quoteNote = String(formData.get('quoteNote') || '').trim();

  try {
    await updateAvailabilitySettings({
      dumpster15NextAvailableDate,
      dumpster15Note,
      quoteNextAvailableDate,
      quoteNote,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Availability settings could not be updated.';
    redirect(`/admin/reservations?error=${encodeURIComponent(message)}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/reservations');
}

export async function updateLeadAction(formData: FormData) {
  await requireAdminSession();

  const leadId = String(formData.get('leadId') || '').trim();
  const intent = String(formData.get('intent') || 'save').trim();
  const pipelineStatus = String(formData.get('pipelineStatus') || '').trim() as LeadPipelineStatus;
  const followUpStatus = String(formData.get('followUpStatus') || '').trim() as LeadFollowUpStatus;
  const followUpDate = String(formData.get('followUpDate') || '').trim();
  const quoteStatus = String(formData.get('quoteStatus') || '').trim() as LeadQuoteStatus;
  const quoteAmount = String(formData.get('quoteAmount') || '').trim();
  const quoteSummary = String(formData.get('quoteSummary') || '').trim();
  const reviewStatus = String(formData.get('reviewStatus') || '').trim() as LeadReviewStatus;
  const jobScheduledDate = String(formData.get('jobScheduledDate') || '').trim();
  const jobScheduledWindow = String(formData.get('jobScheduledWindow') || '').trim();
  const adminNotes = String(formData.get('adminNotes') || '').trim();

  if (!leadPipelineStatuses.includes(pipelineStatus)) {
    redirect('/admin/leads?error=invalid-status');
  }

  if (!leadFollowUpStatuses.includes(followUpStatus)) {
    redirect('/admin/leads?error=invalid-follow-up');
  }

  if (!leadQuoteStatuses.includes(quoteStatus)) {
    redirect('/admin/leads?error=invalid-quote-status');
  }

  if (!leadReviewStatuses.includes(reviewStatus)) {
    redirect('/admin/leads?error=invalid-review-status');
  }

  try {
    const payload = {
      adminNotes,
      followUpDate,
      followUpStatus,
      jobScheduledDate,
      jobScheduledWindow,
      pipelineStatus,
      quoteAmount: quoteAmount || null,
      quoteStatus,
      quoteSummary,
      reviewStatus,
    };

    if (intent === 'convert_to_job') {
      await convertLeadToJob(leadId, payload);
    } else {
      await updateLeadByAdmin(leadId, payload);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'The lead could not be updated.';
    redirect(`/admin/leads?error=${encodeURIComponent(message)}`);
  }

  revalidatePath('/admin/leads');
}

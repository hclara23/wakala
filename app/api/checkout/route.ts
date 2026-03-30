import { NextResponse } from 'next/server';
import type { LeadAttributionInput } from '@/lib/lead-attribution';
import { attachCheckoutSessionToReservation, createReservationDraft } from '@/lib/reservations';
import { checkoutItems, type CheckoutItemId } from '@/lib/site-data';
import { getCheckoutItem, getCheckoutPriceReference, getStripe, resolveBaseUrl } from '@/lib/stripe';

export const runtime = 'nodejs';

type CheckoutRequestBody = {
  attribution?: LeadAttributionInput;
  itemId?: CheckoutItemId;
  customerName?: unknown;
  email?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  preferredDate?: unknown;
  notes?: unknown;
};

function getTextField(
  value: unknown,
  fieldName: string,
  { required = true, maxLength = 120 }: { required?: boolean; maxLength?: number } = {}
) {
  if (typeof value !== 'string') {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }
    return '';
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new Error(`${fieldName} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }

  return trimmed;
}

function validateEmail(value: unknown) {
  const email = getTextField(value, 'Email address', { maxLength: 120 });
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  return email.toLowerCase();
}

function validatePhone(value: unknown) {
  const phone = getTextField(value, 'Phone number', { maxLength: 24 });
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    throw new Error('Enter a valid phone number.');
  }

  return phone;
}

function validateState(value: unknown) {
  const state = getTextField(value, 'State', { maxLength: 2 }).toUpperCase();

  if (!/^[A-Z]{2}$/.test(state)) {
    throw new Error('Enter a valid two-letter state code.');
  }

  return state;
}

function validatePostalCode(value: unknown) {
  const postalCode = getTextField(value, 'ZIP code', { maxLength: 10 });

  if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
    throw new Error('Enter a valid ZIP code.');
  }

  return postalCode;
}

function validatePreferredDate(value: unknown) {
  const preferredDate = getTextField(value, 'Preferred date', {
    required: false,
    maxLength: 10,
  });

  if (!preferredDate) {
    return '';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    throw new Error('Preferred date must use YYYY-MM-DD format.');
  }

  return preferredDate;
}

function buildMetadata(body: CheckoutRequestBody) {
  const customerName = getTextField(body.customerName, 'Full name', { maxLength: 80 });
  const email = validateEmail(body.email);
  const phone = validatePhone(body.phone);
  const addressLine1 = getTextField(body.addressLine1, 'Delivery address', { maxLength: 120 });
  const city = getTextField(body.city, 'City', { maxLength: 60 });
  const state = validateState(body.state);
  const postalCode = validatePostalCode(body.postalCode);
  const preferredDate = validatePreferredDate(body.preferredDate);
  const notes = getTextField(body.notes, 'Placement notes', {
    required: false,
    maxLength: 500,
  });

  return {
    customerName,
    email,
    phone,
    addressLine1,
    city,
    state,
    postalCode,
    preferredDate,
    notes,
    serviceAddress: `${addressLine1}, ${city}, ${state} ${postalCode}`,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutRequestBody;
    const itemId = body?.itemId;

    if (!itemId || !(itemId in checkoutItems)) {
      return NextResponse.json({ error: 'Checkout item is required.' }, { status: 400 });
    }

    const item = getCheckoutItem(itemId);
    const stripe = getStripe();
    const appUrl = resolveBaseUrl(req);
    const metadata = buildMetadata(body);
    const reservation = await createReservationDraft({
      attribution: body.attribution,
      itemId,
      ...metadata,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: reservation.id,
      customer_creation: 'always',
      customer_email: metadata.email,
      line_items: [getCheckoutPriceReference(itemId)],
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      invoice_creation: {
        enabled: true,
      },
      payment_intent_data: {
        description: `${item.name} for ${metadata.serviceAddress}`,
        receipt_email: metadata.email,
        metadata: {
          itemId,
          reservationId: reservation.id,
          customerName: metadata.customerName,
          email: metadata.email,
          phone: metadata.phone,
          addressLine1: metadata.addressLine1,
          city: metadata.city,
          state: metadata.state,
          postalCode: metadata.postalCode,
          serviceAddress: metadata.serviceAddress,
          preferredDate: metadata.preferredDate,
          notes: metadata.notes,
        },
      },
      success_url: `${appUrl}${item.successPath}?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservation.id}`,
      cancel_url: `${appUrl}${item.cancelPath}?reservation_id=${reservation.id}`,
      custom_text: {
        submit: {
          message:
            'Wakala will save your reservation, review the request, and confirm delivery timing and placement from the scheduling dashboard.',
        },
      },
      metadata: {
        itemId,
        reservationId: reservation.id,
        customerName: metadata.customerName,
        email: metadata.email,
        phone: metadata.phone,
        addressLine1: metadata.addressLine1,
        city: metadata.city,
        state: metadata.state,
        postalCode: metadata.postalCode,
        serviceAddress: metadata.serviceAddress,
        preferredDate: metadata.preferredDate,
        notes: metadata.notes,
      },
    });

    await attachCheckoutSessionToReservation(reservation.id, session);

    if (!session.url) {
      throw new Error('Checkout session URL was not created.');
    }

    return NextResponse.json({ url: session.url, reservationId: reservation.id });
  } catch (error: unknown) {
    let message = 'Internal Server Error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as any).message);
    }

    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

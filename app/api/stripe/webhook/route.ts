import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required.');
  }

  return secret;
}

function buildWebhookLogPayload(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};

  return {
    sessionId: session.id,
    customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
    customerEmail: session.customer_details?.email || metadata.email || null,
    customerName: session.customer_details?.name || metadata.customerName || null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    itemId: metadata.itemId || null,
    preferredDate: metadata.preferredDate || null,
    serviceAddress: metadata.serviceAddress || null,
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Stripe webhook endpoint is active. Use POST for webhook events.',
  });
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info(
          '[stripe-webhook] checkout.session.completed',
          JSON.stringify(buildWebhookLogPayload(session))
        );
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info(
          '[stripe-webhook] checkout.session.async_payment_succeeded',
          JSON.stringify(buildWebhookLogPayload(session))
        );
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn(
          '[stripe-webhook] checkout.session.async_payment_failed',
          JSON.stringify(buildWebhookLogPayload(session))
        );
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed.';
    console.error('[stripe-webhook] error', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

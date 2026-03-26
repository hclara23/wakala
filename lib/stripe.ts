import Stripe from 'stripe';
import { checkoutItems, type CheckoutItemId } from '@/lib/site-data';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required.');
    }

    stripeClient = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
    });
  }

  return stripeClient;
}

export function resolveBaseUrl(request?: Request) {
  const appUrl = process.env.APP_URL;

  if (appUrl) {
    return appUrl.startsWith('http') ? appUrl : `https://${appUrl}`;
  }

  if (request) {
    const origin = request.headers.get('origin');
    if (origin) {
      return origin;
    }

    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) {
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      return `${proto}://${forwardedHost}`;
    }

    const host = request.headers.get('host');
    if (host) {
      return `http://${host}`;
    }
  }

  return 'http://localhost:3000';
}

export function getCheckoutItem(itemId: CheckoutItemId) {
  return checkoutItems[itemId];
}

export function getCheckoutPriceReference(itemId: CheckoutItemId) {
  const item = getCheckoutItem(itemId);
  const priceId = process.env[item.priceEnvVar];

  if (priceId) {
    return {
      price: priceId,
      quantity: 1,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing ${item.priceEnvVar}. Create the live Stripe price and add it to your environment before enabling production checkout.`
    );
  }

  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: item.unitAmount,
    },
    quantity: 1,
  };
}

export function formatCurrency(amountInCents?: number | null, currency = 'usd') {
  if (typeof amountInCents !== 'number') {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ITEMS = {
  dumpster_15: {
    name: '15-Yard Dumpster Rental (3 days)',
    description: 'Includes drop-off and pickup within 3 days.',
    amount: 30000
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: 'Stripe is not configured.' };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const itemKey = payload.item || 'dumpster_15';
    const item = ITEMS[itemKey];

    if (!item) {
      return { statusCode: 400, body: 'Invalid item.' };
    }

    const rawOrigin =
      event.headers.origin ||
      process.env.APP_URL ||
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      'http://localhost:8888';
    const origin = rawOrigin.startsWith('http') ? rawOrigin : `https://${rawOrigin}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description
            },
            unit_amount: item.amount
          },
          quantity: 1
        }
      ],
      success_url: `${origin}/thank-you/`,
      cancel_url: `${origin}/#booking`,
      metadata: {
        item: itemKey
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Unable to create checkout session.'
    };
  }
};

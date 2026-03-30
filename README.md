<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/037e4d61-0f20-4130-aec5-e2fd6f83966b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the required values in [.env.local](.env.local):
   - `GEMINI_API_KEY`
   - `APP_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_DUMPSTER_15_RESERVATION`
   - `STRIPE_WEBHOOK_SECRET`
   - `BLOB_READ_WRITE_TOKEN` for Vercel
   - `ADMIN_RESERVATIONS_EMAIL`
   - `ADMIN_RESERVATIONS_PASSWORD`
3. Run the app:
   `npm run dev`

## Stripe Notes

- The live reservation flow expects `STRIPE_PRICE_DUMPSTER_15_RESERVATION` and `STRIPE_WEBHOOK_SECRET`.
- For local webhook testing with Stripe CLI, forward events to:
  `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Subscribe the deployed webhook endpoint to:
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.

## Reservation Dashboard

- On Vercel, reservations are stored durably using `BLOB_READ_WRITE_TOKEN`.
- Netlify Blobs is still supported if the app is deployed there instead.
- Local development falls back to `.data/reservations/`, which is ignored by Git.
- Visit `/admin` and sign in with `ADMIN_RESERVATIONS_EMAIL` and `ADMIN_RESERVATIONS_PASSWORD` to review, confirm, or annotate reservation requests.

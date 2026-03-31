# Wakala Property Services

Marketing site and admin dashboard for Wakala's dumpster reservations, quote intake, and daily job management.

## Stack

- Next.js 15 App Router
- Netlify hosting and Netlify Blobs for production storage
- Stripe Checkout for online dumpster payments
- Google Analytics 4 for traffic and funnel reporting

## Local Development

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`
3. Set the required values:
   - `APP_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_DUMPSTER_15_RESERVATION`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_GA_ID`
   - `GA4_PROPERTY_ID`
   - either `GA_SERVICE_ACCOUNT_EMAIL` plus `GA_SERVICE_ACCOUNT_PRIVATE_KEY`, or `GA_SERVICE_ACCOUNT_JSON`
   - `ADMIN_RESERVATIONS_EMAIL`
   - `ADMIN_RESERVATIONS_PASSWORD`
4. Start the dev server:
   `npm run dev`

## Core Commands

- `npm run dev` starts local development
- `npm run build` creates the production build
- `npm run start` runs the production build locally
- `npm run lint` runs ESLint

## Admin Dashboard

The admin login lives at `/admin`.

After login there are two working areas:

- `/admin/leads`
  Tracks quote requests and reservation starts in one pipeline. Includes source attribution, UTM data, follow-up reminders, quote builder fields, review tracking, convert-to-job controls, CSV export, and 30-day funnel reporting.
- `/admin/reservations`
  Handles paid reservation operations including payment state, scheduling windows, dispatch notes, Google Analytics traffic reporting, and public availability controls for dumpster bookings and quote intake.

The admin pages also include a built-in workflow guide. It auto-opens on first visit for each browser and can be reopened from the page header to train new operators on intake, leads, quotes, jobs, reservations, reviews, and analytics.

The built-in dashboard auth uses:

- `ADMIN_RESERVATIONS_EMAIL`
- `ADMIN_RESERVATIONS_PASSWORD`

For local development these live in `.env.local`. In production, set them in Netlify site environment variables.

## Lead And Reservation Storage

- Production uses Netlify Blobs.
- Local development falls back to:
  - `.data/leads/`
  - `.data/reservations/`

Both directories are ignored by Git.

## Reservation Flow

1. A customer submits the dumpster checkout form.
2. The app creates a reservation draft and a linked lead record.
3. Stripe Checkout collects payment.
4. Stripe webhook events sync payment status back into the reservation and lead records.
5. Wakala confirms the delivery window from the reservation dashboard.

## Availability Controls

- `/admin/reservations` includes smart booking controls for the next available 15-yard dumpster date and the next available quote opening.
- Dumpster openings are computed from scheduled reservation dates plus the configured daily dumpster capacity.
- Quote openings are computed from scheduled lead follow-up dates plus the configured daily quote capacity.
- The homepage booking section shows those computed opening dates to customers.
- The checkout API rejects dumpster preferred dates that are earlier than the allowed floor date or already full for the selected day.

## Quote And Lead Flow

1. A visitor submits the project builder form.
2. The app stores a lead with service type, contact info, notes, page attribution, referrer, and UTM values.
3. The lead appears in `/admin/leads` for follow-up and pipeline updates.

## Quote, Reminder, And Review Workflow

- Use follow-up status and follow-up date on each lead card to track callbacks and overdue reminders.
- Use quote status, quote amount, and quote scope to build and manage manual quotes.
- Use `Convert To Job` on a lead card after the quote is ready. The lead is promoted into a live job stage and can carry a job date and service window.
- Use review status to track when a review was requested and when it was received after the job is done.

## Google Analytics

The public site tag uses `NEXT_PUBLIC_GA_ID`.

The admin dashboard can also read GA4 reporting data. That requires:

- `GA4_PROPERTY_ID`
- either `GA_SERVICE_ACCOUNT_EMAIL` plus `GA_SERVICE_ACCOUNT_PRIVATE_KEY`, or `GA_SERVICE_ACCOUNT_JSON`

The service account must have read access to the GA4 property and the Analytics Data API must be enabled.

Current admin reporting includes:

- sessions, users, and page views
- top landing pages
- top traffic channels
- tracked events for `generate_lead`, `begin_checkout`, and `purchase`
- a 30-day acquisition funnel inside the lead inbox

## Stripe Webhooks

The deployed webhook endpoint is:

- `/api/stripe/webhook`

Subscribe Stripe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

For local webhook testing with Stripe CLI:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Netlify Deployment Notes

- The project is intended to deploy from GitHub to Netlify.
- Make sure the environment variables above are set in Netlify before deploying.
- If admin or analytics settings change in Netlify, trigger a fresh deploy so server-rendered pages pick up the new values.

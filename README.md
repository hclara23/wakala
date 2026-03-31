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
   - either `GA_SERVICE_ACCOUNT_EMAIL` or `GA_CLIENT_EMAIL`
   - `GA_SERVICE_ACCOUNT_PRIVATE_KEY`
   - or `GA_SERVICE_ACCOUNT_JSON` instead of the email/private-key pair
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

The wizard also points the admin to the first setup task on `/admin/reservations#availability-controls`, where they set the initial next available dumpster day and the initial next available quote day before live traffic starts using the forms.

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
- The admin sets an initial next available day for each booking type, and that acts as the earliest allowed floor date for the public site.
- Dumpster openings are computed from that floor date, scheduled reservation dates, and the configured daily dumpster capacity.
- Quote openings are computed from that floor date, scheduled lead follow-up dates, the configured daily quote capacity, and the optional weekday-only rule.
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
- either `GA_SERVICE_ACCOUNT_EMAIL` or `GA_CLIENT_EMAIL`
- `GA_SERVICE_ACCOUNT_PRIVATE_KEY`
- or `GA_SERVICE_ACCOUNT_JSON`

Important:

- `GA4_PROPERTY_ID` must be the numeric GA4 property ID such as `123456789`, not the public measurement ID such as `G-XXXXXXXXXX`.
- The service account must be added directly to the GA4 property with reporting access.
- The Google Analytics Data API must be enabled in the same Google Cloud project as the service account.
- If Netlify environment variables change, trigger a fresh deploy so the server-rendered dashboard picks them up.

Current admin reporting includes:

- sessions, users, and page views
- top landing pages
- top traffic channels
- tracked events for `generate_lead`, `begin_checkout`, and `purchase`
- a 30-day acquisition funnel inside the lead inbox

If the analytics card shows an error banner:

- `could not find GA4 property` usually means `GA4_PROPERTY_ID` is wrong or is still set to the public `G-...` ID.
- `denied reporting access` usually means the service account has not been added to the GA4 property, or the Analytics Data API is not enabled.
- `rejected the service-account credentials` usually means the private key or service account email was pasted incorrectly.
- If only one analytics subsection fails, the dashboard now keeps the rest of the reporting visible and shows a targeted warning instead of blanking the whole panel.

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
- On Personal Netlify plans, deploys can queue behind older builds. If an urgent fix is waiting in queue, cancel the older in-progress deploy and let the newer commit build.

import type { Metadata } from 'next';
import { site } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Terms & Reservation Policy',
  description:
    'Review Wakala reservation terms, payment expectations, scheduling notes, and cancellation guidance for dumpster reservations and service requests.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <section className="space-y-6">
        <p className="section-kicker">Terms & Reservation Policy</p>
        <h1 className="font-serif text-5xl text-white md:text-7xl">
          Clear terms for reservations, scheduling, and payment.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-stone-300">
          These terms are intended to set expectations for the online dumpster reservation flow on
          this site. Final service details may still be confirmed directly with Wakala after checkout.
        </p>
      </section>

      <section className="panel rich-text mt-10 space-y-8 rounded-[2rem] p-8 md:p-10">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Reservations and scheduling</h2>
          <p>
            Online payment secures a reservation request for the listed dumpster offer. Delivery and
            pickup timing are still subject to schedule confirmation, service-area fit, and site access.
          </p>
          <p>
            Customers should provide accurate address and contact information so Wakala can confirm
            the job promptly.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Site access and placement</h2>
          <p>
            The customer is responsible for providing a legal, accessible, and reasonably clear
            placement area. If the site conditions are unsafe or inaccessible, scheduling may need
            to be adjusted.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Payment</h2>
          <p>
            Payments made through the online reservation flow are processed securely through Stripe.
            Additional fees, time extensions, prohibited-material handling, or service changes may
            require direct follow-up if the scope differs from the standard reservation.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Cancellations and changes</h2>
          <p>
            If you need to change or cancel a reservation, contact Wakala as soon as possible at
            {` ${site.phoneDisplay} `}or {site.email}. Refund or rescheduling decisions depend on timing,
            scheduling impact, and whether service resources were already committed.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Scope of services</h2>
          <p>
            Pressure washing, handyman work, yard cleanups, trailer rentals, and small remodel
            projects generally require direct scoping and are not automatically confirmed by the
            online reservation payment flow.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Questions</h2>
          <p>
            Contact Wakala directly if you need clarification before paying online. The fastest path
            is to call {site.phoneDisplay}.
          </p>
        </div>
      </section>
    </div>
  );
}

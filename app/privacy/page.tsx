import type { Metadata } from 'next';
import { site } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read how Wakala handles contact, service address, and payment-related information for reservations and service inquiries.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <section className="space-y-6">
        <p className="section-kicker">Privacy Policy</p>
        <h1 className="font-serif text-5xl text-white md:text-7xl">
          How Wakala handles customer and reservation information.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-stone-300">
          This site collects only the information needed to respond to service inquiries, process
          dumpster reservation payments, and coordinate delivery and pickup logistics.
        </p>
      </section>

      <section className="panel rich-text mt-10 space-y-8 rounded-[2rem] p-8 md:p-10">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">What we collect</h2>
          <p>
            Wakala may collect your name, email address, phone number, service address, preferred
            reservation date, and project notes when you submit a reservation or contact request.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">How payment data is handled</h2>
          <p>
            Card payments are processed through Stripe Checkout. Wakala does not store raw card
            numbers or security codes on this site.
          </p>
          <p>
            Stripe may collect billing and payment information directly as part of the checkout
            process. Their handling of payment data is governed by Stripe&apos;s own policies and
            compliance controls.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">How information is used</h2>
          <ul className="space-y-3">
            <li>To confirm reservation requests and contact you about scheduling.</li>
            <li>To identify the correct delivery or service location.</li>
            <li>To issue receipts, invoices, or payment confirmations.</li>
            <li>To respond to customer support, rescheduling, or cancellation questions.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Information sharing</h2>
          <p>
            Wakala does not sell customer information. Data may be shared only with service
            providers needed to operate the reservation workflow, such as Stripe for payment
            processing or infrastructure providers hosting the site.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-white">Questions</h2>
          <p>
            For privacy questions or to update your reservation contact details, call {site.phoneDisplay}
            {' '}or email {site.email}.
          </p>
        </div>
      </section>
    </div>
  );
}

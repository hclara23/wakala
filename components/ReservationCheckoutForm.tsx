'use client';

import { useMemo, useState } from 'react';
import { Loader2, LockKeyhole } from 'lucide-react';
import { getClientLeadAttribution } from '@/lib/lead-attribution';
import { trackEvent } from '@/lib/gtag';
import type { CheckoutItemId } from '@/lib/site-data';
import { cn } from '@/lib/utils';

type ReservationFormState = {
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  preferredDate: string;
  notes: string;
};

const initialState: ReservationFormState = {
  customerName: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: 'El Paso',
  state: 'TX',
  postalCode: '',
  preferredDate: '',
  notes: '',
};

interface ReservationCheckoutFormProps {
  itemId: CheckoutItemId;
  itemLabel: string;
  buttonLabel: string;
  className?: string;
}

export default function ReservationCheckoutForm({
  itemId,
  itemLabel,
  buttonLabel,
  className,
}: ReservationCheckoutFormProps) {
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  function updateField(field: keyof ReservationFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          attribution: getClientLeadAttribution(),
          ...formState,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to start secure checkout.');
      }

      if (!payload.url) {
        throw new Error('Checkout URL was not returned.');
      }

      trackEvent('begin_checkout', {
        currency: 'USD',
        item_id: itemId,
        item_name: itemLabel,
        value: 300,
      });

      window.location.assign(payload.url);
    } catch (checkoutError: unknown) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to start secure checkout.';
      console.error('Reservation checkout error:', checkoutError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={cn('space-y-5', className)} onSubmit={handleSubmit}>
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-4 text-sm leading-6 text-stone-200">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p>
          Start the reservation by confirming contact and delivery details here. Wakala saves the
          request immediately, then routes you to secure payment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="customerName">
            Full Name
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={formState.customerName}
            onChange={(event) => updateField('customerName', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={24}
            value={formState.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
            placeholder="(915) 555-1234"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          value={formState.email}
          onChange={(event) => updateField('email', event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="addressLine1">
          Delivery Address
        </label>
        <input
          id="addressLine1"
          name="addressLine1"
          type="text"
          autoComplete="street-address"
          required
          maxLength={120}
          value={formState.addressLine1}
          onChange={(event) => updateField('addressLine1', event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
          placeholder="1234 Project Site Rd"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.2fr_0.55fr_0.75fr]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            required
            maxLength={60}
            value={formState.city}
            onChange={(event) => updateField('city', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="state">
            State
          </label>
          <input
            id="state"
            name="state"
            type="text"
            autoComplete="address-level1"
            required
            maxLength={2}
            value={formState.state}
            onChange={(event) => updateField('state', event.target.value.toUpperCase())}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="postalCode">
            ZIP
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            required
            maxLength={10}
            value={formState.postalCode}
            onChange={(event) => updateField('postalCode', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
            placeholder="79901"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="preferredDate">
            Preferred Date
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={minDate}
            value={formState.preferredDate}
            onChange={(event) => updateField('preferredDate', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/45"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300" htmlFor="notes">
            Placement Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={1}
            maxLength={500}
            value={formState.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            className="min-h-[3.25rem] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300/45"
            placeholder="Gate codes, driveway notes, or scheduling details"
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Reservation</p>
        <p className="mt-2 text-base text-white">{itemLabel}</p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-300 px-6 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? 'Opening secure checkout...' : buttonLabel}
      </button>
    </form>
  );
}

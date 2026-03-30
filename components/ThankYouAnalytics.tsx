'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/gtag';

type ThankYouAnalyticsProps = {
  currency: string;
  isPaid: boolean;
  itemName: string;
  reservationId: string | null;
  transactionId: string | null;
  value: number | null;
};

export default function ThankYouAnalytics({
  currency,
  isPaid,
  itemName,
  reservationId,
  transactionId,
  value,
}: ThankYouAnalyticsProps) {
  useEffect(() => {
    if (!isPaid || !transactionId) {
      return;
    }

    const storageKey = `wakala-purchase-${transactionId}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    trackEvent('purchase', {
      currency,
      transaction_id: transactionId,
      value,
      items: [
        {
          item_id: reservationId || transactionId,
          item_name: itemName,
          price: value,
          quantity: 1,
        },
      ],
    });

    window.sessionStorage.setItem(storageKey, '1');
  }, [currency, isPaid, itemName, reservationId, transactionId, value]);

  return null;
}

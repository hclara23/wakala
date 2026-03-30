type EventValue = string | number | boolean | null | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params: Record<string, EventValue | EventValue[] | Record<string, EventValue>[]> = {}
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

export type LeadAttributionInput = {
  pageUrl?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
};

export type LeadAttribution = {
  pageUrl: string;
  landingPage: string;
  referrer: string;
  referrerHost: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
};

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function normalizePageUrl(value: unknown) {
  const normalized = normalizeText(value, 320);

  if (!normalized) {
    return {
      pageUrl: '',
      landingPage: '',
    };
  }

  try {
    const parsed = new URL(normalized);
    return {
      pageUrl: `${parsed.pathname}${parsed.search}`.slice(0, 320),
      landingPage: parsed.pathname.slice(0, 160),
    };
  } catch {
    if (!normalized.startsWith('/')) {
      return {
        pageUrl: '',
        landingPage: '',
      };
    }

    const [pathname] = normalized.split('?');
    return {
      pageUrl: normalized,
      landingPage: pathname.slice(0, 160),
    };
  }
}

function normalizeReferrer(value: unknown) {
  const normalized = normalizeText(value, 320);

  if (!normalized) {
    return {
      referrer: '',
      referrerHost: '',
    };
  }

  try {
    const parsed = new URL(normalized);
    return {
      referrer: normalized,
      referrerHost: parsed.host.slice(0, 160),
    };
  } catch {
    return {
      referrer: normalized,
      referrerHost: '',
    };
  }
}

export function normalizeLeadAttribution(input?: LeadAttributionInput | null): LeadAttribution {
  const page = normalizePageUrl(input?.pageUrl);
  const referrer = normalizeReferrer(input?.referrer);

  return {
    ...page,
    ...referrer,
    utmSource: normalizeText(input?.utmSource, 120),
    utmMedium: normalizeText(input?.utmMedium, 120),
    utmCampaign: normalizeText(input?.utmCampaign, 160),
    utmTerm: normalizeText(input?.utmTerm, 160),
    utmContent: normalizeText(input?.utmContent, 160),
  };
}

export function getClientLeadAttribution(): LeadAttributionInput {
  if (typeof window === 'undefined') {
    return {};
  }

  const currentUrl = new URL(window.location.href);

  return {
    pageUrl: `${currentUrl.pathname}${currentUrl.search}`,
    referrer: document.referrer || '',
    utmSource: currentUrl.searchParams.get('utm_source') || '',
    utmMedium: currentUrl.searchParams.get('utm_medium') || '',
    utmCampaign: currentUrl.searchParams.get('utm_campaign') || '',
    utmTerm: currentUrl.searchParams.get('utm_term') || '',
    utmContent: currentUrl.searchParams.get('utm_content') || '',
  };
}

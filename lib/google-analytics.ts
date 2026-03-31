import { JWT } from 'google-auth-library';

type ReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

type ReportResponse = {
  rows?: ReportRow[];
  totals?: Array<{
    metricValues?: Array<{ value?: string }>;
  }>;
};

type GoogleApiErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export type GoogleAnalyticsDashboard = {
  dateRangeDays: number;
  trackingId: string | null;
  trackingEnabled: boolean;
  reportingEnabled: boolean;
  missingConfiguration: string[];
  message: string | null;
  summary: {
    totalUsers: number;
    sessions: number;
    pageViews: number;
    engagementRate: number;
    averageSessionDuration: number;
  } | null;
  realtimeActiveUsers: number | null;
  topPages: Array<{
    pagePath: string;
    pageViews: number;
    sessions: number;
  }>;
  topChannels: Array<{
    channel: string;
    sessions: number;
    users: number;
  }>;
  conversions: Array<{
    eventKey: string;
    eventName: string;
    count: number;
  }>;
};

type ServiceAccountJson = {
  client_email?: string;
  private_key?: string;
};

class AnalyticsRequestError extends Error {
  status: number;
  code: string | null;
  apiMessage: string | null;

  constructor(status: number, code: string | null, apiMessage: string | null) {
    super(`Google Analytics request failed with status ${status}.`);
    this.name = 'AnalyticsRequestError';
    this.status = status;
    this.code = code;
    this.apiMessage = apiMessage;
  }
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === 'string') {
      const normalized = stripWrappingQuotes(value);

      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
}

function normalizePrivateKey(value: string) {
  return stripWrappingQuotes(value).replace(/\\n/g, '\n').replace(/\r/g, '').trim();
}

function normalizePropertyId(value: string) {
  return stripWrappingQuotes(value).replace(/^properties\//, '').trim();
}

function maskEmailAddress(value: string) {
  const [localPart, domain] = value.split('@');

  if (!localPart || !domain) {
    return value;
  }

  const visibleLocalPart =
    localPart.length <= 4 ? localPart : `${localPart.slice(0, 4)}...`;

  return `${visibleLocalPart}@${domain}`;
}

function getAnalyticsConfig() {
  const serviceAccountJson =
    firstNonEmpty(
      process.env.GA_SERVICE_ACCOUNT_JSON,
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ) || '';

  let parsedServiceAccountJson: ServiceAccountJson | null = null;
  let invalidServiceAccountJson = false;

  if (serviceAccountJson) {
    try {
      parsedServiceAccountJson = JSON.parse(serviceAccountJson) as ServiceAccountJson;
    } catch {
      invalidServiceAccountJson = true;
    }
  }

  const propertyId = normalizePropertyId(
    firstNonEmpty(
      process.env.GA4_PROPERTY_ID,
      process.env.GA_PROPERTY_ID,
      process.env.GOOGLE_ANALYTICS_PROPERTY_ID
    )
  );
  const serviceAccountEmail = firstNonEmpty(
    process.env.GA_SERVICE_ACCOUNT_EMAIL,
    process.env.GA_CLIENT_EMAIL,
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    parsedServiceAccountJson?.client_email
  );
  const privateKey = normalizePrivateKey(
    firstNonEmpty(
      process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY,
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      parsedServiceAccountJson?.private_key
    )
  );
  const missingConfiguration: string[] = [];

  if (!propertyId) {
    missingConfiguration.push('GA4_PROPERTY_ID');
  }

  if (!serviceAccountEmail) {
    missingConfiguration.push(
      serviceAccountJson
        ? 'GA_SERVICE_ACCOUNT_EMAIL or valid GA_SERVICE_ACCOUNT_JSON'
        : 'GA_SERVICE_ACCOUNT_EMAIL'
    );
  }

  if (!privateKey) {
    missingConfiguration.push(
      serviceAccountJson
        ? 'GA_SERVICE_ACCOUNT_PRIVATE_KEY or valid GA_SERVICE_ACCOUNT_JSON'
        : 'GA_SERVICE_ACCOUNT_PRIVATE_KEY'
    );
  }

  return {
    trackingId: firstNonEmpty(process.env.NEXT_PUBLIC_GA_ID),
    propertyId,
    serviceAccountEmail,
    privateKey,
    invalidServiceAccountJson,
    missingConfiguration,
  };
}

function getReportingPath(propertyId: string, method: 'runReport' | 'runRealtimeReport') {
  return `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${method}`;
}

function toNumber(value?: string) {
  const parsed = Number(value || '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatEventName(eventName: string) {
  return eventName.replace(/_/g, ' ');
}

function getDateRange(days: number) {
  return [{ startDate: `${days}daysAgo`, endDate: 'today' }];
}

function parseGoogleApiError(rawBody: string) {
  if (!rawBody) {
    return {
      code: null,
      message: null,
    };
  }

  try {
    const parsed = JSON.parse(rawBody) as GoogleApiErrorPayload;

    return {
      code: parsed.error?.status || null,
      message: parsed.error?.message || null,
    };
  } catch {
    return {
      code: null,
      message: rawBody.trim() || null,
    };
  }
}

async function runAnalyticsRequest(
  accessToken: string,
  propertyId: string,
  method: 'runReport' | 'runRealtimeReport',
  body: object
) {
  const response = await fetch(getReportingPath(propertyId, method), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const rawBody = await response.text();
    const parsedError = parseGoogleApiError(rawBody);

    throw new AnalyticsRequestError(
      response.status,
      parsedError.code,
      parsedError.message
    );
  }

  return (await response.json()) as ReportResponse;
}

function getErrorText(error: unknown) {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }

  return '';
}

function describeGoogleAnalyticsFailure(
  error: unknown,
  config: ReturnType<typeof getAnalyticsConfig>,
  contextLabel?: string
) {
  const propertyId = config.propertyId || 'unknown';
  const maskedEmail = config.serviceAccountEmail
    ? maskEmailAddress(config.serviceAccountEmail)
    : 'unknown service account';
  const contextPrefix = contextLabel ? `${contextLabel}: ` : '';

  if (error instanceof AnalyticsRequestError) {
    const apiMessage = error.apiMessage || '';
    const normalizedMessage = apiMessage.toLowerCase();
    const code = error.code || '';

    if (
      error.status === 404 ||
      code === 'NOT_FOUND' ||
      (normalizedMessage.includes('property') && normalizedMessage.includes('not found'))
    ) {
      return `${contextPrefix}Google Analytics could not find GA4 property ${propertyId}. Netlify GA4_PROPERTY_ID must be the numeric property ID, not the public tracking ID ${config.trackingId || '(missing tracking ID)'}.`;
    }

    if (
      error.status === 401 ||
      code === 'UNAUTHENTICATED' ||
      normalizedMessage.includes('invalid_grant') ||
      normalizedMessage.includes('invalid jwt') ||
      normalizedMessage.includes('private key')
    ) {
      return `${contextPrefix}Google rejected the service-account credentials for ${maskedEmail}. Re-copy the private key and email env vars exactly as issued in Google Cloud, then redeploy Netlify.`;
    }

    if (
      error.status === 403 ||
      code === 'PERMISSION_DENIED' ||
      normalizedMessage.includes('permission') ||
      normalizedMessage.includes('not have permission')
    ) {
      return `${contextPrefix}Google denied reporting access to GA4 property ${propertyId} for ${maskedEmail}. Add that service account as a user on the GA4 property and make sure the Analytics Data API is enabled in the matching Google Cloud project.`;
    }

    if (
      error.status === 400 ||
      code === 'INVALID_ARGUMENT' ||
      normalizedMessage.includes('invalid argument')
    ) {
      return `${contextPrefix}Google rejected the reporting request for GA4 property ${propertyId}. Double-check that GA4_PROPERTY_ID is the numeric property ID and that the property contains a web data stream for tracking ID ${config.trackingId || 'unknown'}.`;
    }

    if (error.status === 429 || code === 'RESOURCE_EXHAUSTED') {
      return `${contextPrefix}Google Analytics reporting is being rate-limited right now. Try the dashboard again in a minute.`;
    }

    const detail = apiMessage ? ` Google said: ${apiMessage}` : '';

    return `${contextPrefix}Google Analytics reporting failed for GA4 property ${propertyId} with status ${error.status}.${detail}`;
  }

  const fallbackMessage = getErrorText(error).toLowerCase();

  if (
    fallbackMessage.includes('invalid_grant') ||
    fallbackMessage.includes('private key') ||
    fallbackMessage.includes('pem')
  ) {
    return `${contextPrefix}Google could not use the configured service-account key for ${maskedEmail}. Re-copy the private key env var and redeploy Netlify.`;
  }

  if (fallbackMessage.includes('access token')) {
    return `${contextPrefix}Google Analytics could not mint an access token for ${maskedEmail}. Check the service account credentials in Netlify and redeploy.`;
  }

  return `${contextPrefix}Google Analytics tracking is present, but the dashboard could not read reporting data for GA4 property ${propertyId}. Check the GA4 property ID, service account access, and Analytics Data API enablement.`;
}

export async function getGoogleAnalyticsDashboard(): Promise<GoogleAnalyticsDashboard> {
  const config = getAnalyticsConfig();
  const trackingEnabled = Boolean(config.trackingId);
  const reportingEnabled = Boolean(
    config.trackingId &&
      config.propertyId &&
      config.serviceAccountEmail &&
      config.privateKey
  );

  if (!trackingEnabled) {
    return {
      dateRangeDays: 30,
      trackingId: null,
      trackingEnabled: false,
      reportingEnabled: false,
      missingConfiguration: ['NEXT_PUBLIC_GA_ID'],
      message: 'Google Analytics tracking is not configured for this site yet.',
      summary: null,
      realtimeActiveUsers: null,
      topPages: [],
      topChannels: [],
      conversions: [],
    };
  }

  if (!reportingEnabled) {
    return {
      dateRangeDays: 30,
      trackingId: config.trackingId,
      trackingEnabled: true,
      reportingEnabled: false,
      missingConfiguration: config.missingConfiguration,
      message:
        config.invalidServiceAccountJson
          ? 'Tracking is installed, but the GA service account JSON could not be parsed. In Netlify, fix GA_SERVICE_ACCOUNT_JSON or use GA_SERVICE_ACCOUNT_EMAIL plus GA_SERVICE_ACCOUNT_PRIVATE_KEY, then trigger a fresh deploy.'
          : `Tracking is installed, but dashboard reporting is still missing ${config.missingConfiguration.join(', ')}. In Netlify, add the missing production variables and trigger a fresh deploy.`,
      summary: null,
      realtimeActiveUsers: null,
      topPages: [],
      topChannels: [],
      conversions: [],
    };
  }

  try {
    const jwt = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    const tokenResponse = await jwt.authorize();
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      throw new Error('Google Analytics access token could not be created.');
    }

    const [summaryResult, realtimeResult, topPagesResult, topChannelsResult, conversionsResult] =
      await Promise.allSettled([
        runAnalyticsRequest(accessToken, config.propertyId, 'runReport', {
          dateRanges: getDateRange(30),
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
          ],
        }),
        runAnalyticsRequest(accessToken, config.propertyId, 'runRealtimeReport', {
          metrics: [{ name: 'activeUsers' }],
        }),
        runAnalyticsRequest(accessToken, config.propertyId, 'runReport', {
          dateRanges: getDateRange(30),
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 5,
        }),
        runAnalyticsRequest(accessToken, config.propertyId, 'runReport', {
          dateRanges: getDateRange(30),
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        }),
        runAnalyticsRequest(accessToken, config.propertyId, 'runReport', {
          dateRanges: getDateRange(30),
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['generate_lead', 'begin_checkout', 'purchase'],
              },
            },
          },
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: 10,
        }),
      ]);

    if (summaryResult.status === 'rejected') {
      throw summaryResult.reason;
    }

    const summaryReport = summaryResult.value;
    const realtimeReport = realtimeResult.status === 'fulfilled' ? realtimeResult.value : null;
    const topPagesReport = topPagesResult.status === 'fulfilled' ? topPagesResult.value : null;
    const topChannelsReport =
      topChannelsResult.status === 'fulfilled' ? topChannelsResult.value : null;
    const conversionsReport =
      conversionsResult.status === 'fulfilled' ? conversionsResult.value : null;
    const partialWarnings = [
      realtimeResult.status === 'rejected'
        ? describeGoogleAnalyticsFailure(
            realtimeResult.reason,
            config,
            'Realtime users could not be loaded'
          )
        : null,
      topPagesResult.status === 'rejected'
        ? describeGoogleAnalyticsFailure(
            topPagesResult.reason,
            config,
            'Top-page reporting could not be loaded'
          )
        : null,
      topChannelsResult.status === 'rejected'
        ? describeGoogleAnalyticsFailure(
            topChannelsResult.reason,
            config,
            'Traffic-channel reporting could not be loaded'
          )
        : null,
      conversionsResult.status === 'rejected'
        ? describeGoogleAnalyticsFailure(
            conversionsResult.reason,
            config,
            'Lead-event reporting could not be loaded'
          )
        : null,
    ].filter(Boolean) as string[];

    const summaryMetrics = summaryReport.totals?.[0]?.metricValues || [];

    return {
      dateRangeDays: 30,
      trackingId: config.trackingId,
      trackingEnabled: true,
      reportingEnabled: true,
      missingConfiguration: [],
      message: partialWarnings.length > 0 ? partialWarnings.join(' ') : null,
      summary: {
        totalUsers: toNumber(summaryMetrics[0]?.value),
        sessions: toNumber(summaryMetrics[1]?.value),
        pageViews: toNumber(summaryMetrics[2]?.value),
        engagementRate: toNumber(summaryMetrics[3]?.value),
        averageSessionDuration: toNumber(summaryMetrics[4]?.value),
      },
      realtimeActiveUsers: toNumber(
        realtimeReport?.rows?.[0]?.metricValues?.[0]?.value || '0'
      ),
      topPages: (topPagesReport?.rows || []).map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || '/',
        pageViews: toNumber(row.metricValues?.[0]?.value),
        sessions: toNumber(row.metricValues?.[1]?.value),
      })),
      topChannels: (topChannelsReport?.rows || []).map((row) => ({
        channel: row.dimensionValues?.[0]?.value || 'Unassigned',
        sessions: toNumber(row.metricValues?.[0]?.value),
        users: toNumber(row.metricValues?.[1]?.value),
      })),
      conversions: (conversionsReport?.rows || []).map((row) => ({
        eventKey: row.dimensionValues?.[0]?.value || 'event',
        eventName: formatEventName(row.dimensionValues?.[0]?.value || 'event'),
        count: toNumber(row.metricValues?.[0]?.value),
      })),
    };
  } catch (error) {
    console.error('Google Analytics dashboard error:', error);

    return {
      dateRangeDays: 30,
      trackingId: config.trackingId,
      trackingEnabled: true,
      reportingEnabled: false,
      missingConfiguration: config.missingConfiguration,
      message: describeGoogleAnalyticsFailure(error, config),
      summary: null,
      realtimeActiveUsers: null,
      topPages: [],
      topChannels: [],
      conversions: [],
    };
  }
}

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

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, '\n').trim();
}

function normalizePropertyId(value: string) {
  return value.replace(/^properties\//, '').trim();
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
      serviceAccountJson ? 'GA_SERVICE_ACCOUNT_EMAIL or valid GA_SERVICE_ACCOUNT_JSON' : 'GA_SERVICE_ACCOUNT_EMAIL'
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
    throw new Error(`Google Analytics request failed with status ${response.status}.`);
  }

  return (await response.json()) as ReportResponse;
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

    const [summaryReport, realtimeReport, topPagesReport, topChannelsReport, conversionsReport] =
      await Promise.all([
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

    const summaryMetrics = summaryReport.totals?.[0]?.metricValues || [];

    return {
      dateRangeDays: 30,
      trackingId: config.trackingId,
      trackingEnabled: true,
      reportingEnabled: true,
      missingConfiguration: [],
      message: null,
      summary: {
        totalUsers: toNumber(summaryMetrics[0]?.value),
        sessions: toNumber(summaryMetrics[1]?.value),
        pageViews: toNumber(summaryMetrics[2]?.value),
        engagementRate: toNumber(summaryMetrics[3]?.value),
        averageSessionDuration: toNumber(summaryMetrics[4]?.value),
      },
      realtimeActiveUsers: toNumber(
        realtimeReport.rows?.[0]?.metricValues?.[0]?.value || '0'
      ),
      topPages: (topPagesReport.rows || []).map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || '/',
        pageViews: toNumber(row.metricValues?.[0]?.value),
        sessions: toNumber(row.metricValues?.[1]?.value),
      })),
      topChannels: (topChannelsReport.rows || []).map((row) => ({
        channel: row.dimensionValues?.[0]?.value || 'Unassigned',
        sessions: toNumber(row.metricValues?.[0]?.value),
        users: toNumber(row.metricValues?.[1]?.value),
      })),
      conversions: (conversionsReport.rows || []).map((row) => ({
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
      message:
        'Google Analytics tracking is present, but the dashboard could not read reporting data. Check the GA4 property ID, service account access, and Analytics Data API enablement.',
      summary: null,
      realtimeActiveUsers: null,
      topPages: [],
      topChannels: [],
      conversions: [],
    };
  }
}

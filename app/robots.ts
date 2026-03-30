import type { MetadataRoute } from 'next';
import { site } from '@/lib/site-data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/thank-you', '/checkout/canceled', '/admin'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}

import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { site } from '@/lib/site-data';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} | El Paso, TX`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    'El Paso dumpster rental',
    'El Paso pressure washing',
    'yard cleanup El Paso',
    'handyman services El Paso',
    'roll-off dumpster El Paso',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${site.title} | El Paso, TX`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: site.ogImage,
        alt: `${site.name} work preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.title} | El Paso, TX`,
    description: site.description,
    images: [site.ogImage],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  image: `${site.url}${site.ogImage}`,
  url: site.url,
  telephone: `+1${site.phone}`,
  email: site.email,
  areaServed: site.areaServed,
  description: site.description,
  sameAs: [site.googleBusinessUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-black font-sans text-white antialiased" suppressHydrationWarning>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <div className="relative isolate min-h-screen overflow-x-hidden">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

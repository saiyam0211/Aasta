import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';
import Script from 'next/script';
import ClientRoot from '@/components/client-root';

const brandFont = localFont({
  src: [
    {
      path: '../../public/fonts/Tanjambore_bysaiyam-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aasta.food'),
  title: 'Aasta',
  description:
    'Premium food delivery service operating from 9 PM to 12 AM. Order your favorite meals for late-night delivery with fast, reliable service.',
  keywords:
    'night delivery, food delivery, late night food, premium delivery, restaurant delivery, midnight food',
  authors: [{ name: 'Aasta Team' }],
  creator: 'Aasta',
  publisher: 'Aasta',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/icons/Aasta_Logos_192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/Aasta_Logos_512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icons/Aasta_Logos_192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/icons/Aasta_Logos_192x192.png',
  },
  other: {
    'format-detection': 'telephone=no',
    'theme-color': '#002a01',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aasta.food',
    title: 'Aasta',
    description: 'Premium food delivery service operating from 9 PM to 12 AM',
    siteName: 'Aasta',
    images: [
      {
        url: '/icons/Aasta_Logos_512x512.png',
        width: 512,
        height: 512,
        alt: 'Aasta Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aasta',
    description: 'Premium food delivery service operating from 9 PM to 12 AM',
    images: ['/icons/Aasta_Logos_512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#002a01',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${brandFont.variable}`}>
      <head>
        <meta
          name="description"
          content="Premium night food delivery service"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#002a01" />

        <link rel="apple-touch-icon" href="/icons/Aasta_Logos_192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/Aasta_Logos_192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/Aasta_Logos_192x192.png"
        />
        <link
          rel="mask-icon"
          href="/icons/Aasta_Logos_192x192.png"
          color="#002a01"
        />
        <link rel="shortcut icon" href="/icons/Aasta_Logos_192x192.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://www.aasta.food" />
        <meta name="twitter:title" content="Aasta" />
        <meta
          name="twitter:description"
          content="Premium food delivery service operating from 9 PM to 12 AM"
        />
        <meta name="twitter:image" content="/icons/Aasta_Logos_512x512.png" />
        <meta name="twitter:creator" content="@aasta" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Aasta" />
        <meta
          property="og:description"
          content="Premium food delivery service operating from 9 PM to 12 AM"
        />
        <meta property="og:site_name" content="Aasta" />
        <meta property="og:url" content="https://www.aasta.food" />
        <meta property="og:image" content="/icons/Aasta_Logos_512x512.png" />

      </head>
      <body className="pb-safe font-sans antialiased">
        <Providers>
          <ClientRoot>{children}</ClientRoot>
        </Providers>
      </body>
    </html>
  );
}

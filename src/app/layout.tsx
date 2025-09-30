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
  // manifest: '/manifest.json', // PWA disabled
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aasta',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.jpg',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1668-2388.jpg',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1536-2048.jpg',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1125-2436.jpg',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1242-2688.jpg',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-750-1334.jpg',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-640-1136.jpg',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Aasta',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#002a01',
    'msapplication-config': '/browserconfig.xml',
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
        <meta name="application-name" content="Aasta" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Aasta" />
        <meta
          name="description"
          content="Premium night food delivery service"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#002a01" />
        <meta name="msapplication-tap-highlight" content="no" />
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
        {/* <link rel="manifest" href="/manifest.json" /> */}
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

        {/* <Script id="pwa-install-prompt" strategy="afterInteractive">
          {`
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              const installBtn = document.createElement('button');
              installBtn.innerText = 'Install Aasta App';
              installBtn.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);z-index:1000;padding:12px 20px;background:#000;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer;display:none';
              installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                  }
                  deferredPrompt = null;
                  installBtn.remove();
                }
              });
              document.body.appendChild(installBtn);
            });
          `}
        </Script> */}
      </head>
      <body className="pt-safe pb-safe font-sans antialiased">
        <Providers>
          <ClientRoot>{children}</ClientRoot>
        </Providers>
      </body>
    </html>
  );
}

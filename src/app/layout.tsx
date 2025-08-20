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
  title: 'Aasta - Night Delivery',
  description:
    'Premium food delivery service operating from 9 PM to 12 AM, offering restaurant-quality meals at discounted prices.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aasta',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#002a01',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${brandFont.variable}`}>
      <head>
        <Script id="splash-screen-prevention" strategy="beforeInteractive">
          {`
            // Immediately hide any splash screen elements
            (function() {
              // Hide any potential splash screen images
              const splashImages = document.querySelectorAll('img[src*="aasta_icon_logo"], img[src*="icon-192x192"], img[src*="icon-512x512"]');
              splashImages.forEach(img => {
                img.style.display = 'none';
                img.style.opacity = '0';
                img.style.visibility = 'hidden';
              });
              
              // Set body background to transparent
              document.body.style.background = 'transparent';
              document.body.style.backgroundImage = 'none';
              
              // Check if this is a PWA launch
              const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
              const isIOSStandalone = window.navigator.standalone === true;
              
              if (isStandalone || isIOSStandalone) {
                // For PWA launches, ensure video overlay shows immediately
                document.documentElement.style.background = 'black';
                document.body.style.background = 'black';
              }
            })();
          `}
        </Script>
        <Script id="pwa-install-prompt" strategy="afterInteractive">
          {`
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              const installBtn = document.createElement('button');
              installBtn.innerText = 'Install Aasta App';
              installBtn.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);z-index:1000;padding:12px 20px;background:#002a01;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer;';
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
        </Script>
      </head>
      <body className="pt-safe pb-safe font-sans antialiased">
        <Providers>
          <ClientRoot>{children}</ClientRoot>
        </Providers>
      </body>
    </html>
  );
}

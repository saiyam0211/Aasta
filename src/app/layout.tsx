import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TelegramBotInitializer } from "@/components/telegram-bot-initializer";
import Script from "next/script";

// Import bot initialization (server-side only)
import '@/lib/telegram-bot-init';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aasta - Night Delivery",
  description: "Premium food delivery service operating from 9 PM to 12 AM, offering restaurant-quality meals at discounted prices.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#002a01",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script id="pwa-install-prompt" strategy="afterInteractive">
          {`
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              const installBtn = document.createElement('button');
              installBtn.innerText = 'Install Aasta App';
              installBtn.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:1000;padding:12px 20px;background:#002a01;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer;';
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
      <body className={inter.className}>
        <Providers>
          <TelegramBotInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}

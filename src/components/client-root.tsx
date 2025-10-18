'use client';

import BackHandler from '@/components/back-handler';
import InitialSplash from '@/components/initial-splash';
import StatusBarOverlay from '@/components/statusbar-overlay';
import FCMInitializer from '@/components/fcm-initializer';

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StatusBarOverlay />
      <BackHandler />
      <InitialSplash />
      <FCMInitializer />
      {children}
    </>
  );
}

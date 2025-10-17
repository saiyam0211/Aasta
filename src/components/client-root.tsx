'use client';

import NativeBridge from '@/components/native-bridge';
import BackHandler from '@/components/back-handler';
import InitialSplash from '@/components/initial-splash';
import StatusBarOverlay from '@/components/status-bar-overlay';

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NativeBridge />
      <BackHandler />
      <InitialSplash />
      <StatusBarOverlay />
      {children}
    </>
  );
}

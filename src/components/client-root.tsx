'use client';

import BackHandler from '@/components/back-handler';
import InitialSplash from '@/components/initial-splash';
import StatusBarOverlay from '@/components/statusbar-overlay';

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
      {children}
    </>
  );
}

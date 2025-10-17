'use client';

import BackHandler from '@/components/back-handler';
import InitialSplash from '@/components/initial-splash';

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackHandler />
      <InitialSplash />
      {children}
    </>
  );
}

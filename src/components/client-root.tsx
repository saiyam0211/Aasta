'use client';

import NativeBridge from '@/components/native-bridge';
import BackHandler from '@/components/back-handler';
import InitialSplash from '@/components/initial-splash';

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
      {children}
    </>
  );
}

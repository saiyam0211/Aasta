'use client';

import NativeBridge from '@/components/native-bridge';

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NativeBridge />
      {children}
    </>
  );
}

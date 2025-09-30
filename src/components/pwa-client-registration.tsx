'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PWAClientRegistrationProps {
  pageIdentifier: string;
}

export default function PWAClientRegistration({
  pageIdentifier,
}: PWAClientRegistrationProps) {
  const { data: session } = useSession();

  useEffect(() => {
    // PWA client registration disabled for now
    return;

  }, [session?.user?.id, pageIdentifier]);

  return null; // This component doesn't render anything
}

'use client';

import NativeBridge from '@/components/native-bridge';
import StartupVideoOverlay from '@/components/startup-video-overlay';

export default function ClientRoot({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<StartupVideoOverlay />
			<NativeBridge />
			{children}
		</>
	);
}

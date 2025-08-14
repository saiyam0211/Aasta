"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function NativeReturn() {
	const params = useSearchParams();
	useEffect(() => {
		const to = params.get('to') || '/customer';
		const target = `aasta://callback?to=${encodeURIComponent(to)}`;
		// Attempt to open the custom scheme immediately
		window.location.replace(target);
	}, [params]);

	return (
		<div style={{ padding: 24 }}>
			<p>Returning to app…</p>
			<p>
				If this does not open automatically, tap
				{' '}<a href="aasta://callback?to=/customer">open in app</a>.
			</p>
		</div>
	);
} 
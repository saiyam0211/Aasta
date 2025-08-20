"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function StartupVideoOverlay() {
	const pathname = usePathname();
	const [show, setShow] = useState(false);
	const [canAutoplay, setCanAutoplay] = useState(true);
	const timeoutRef = useRef<number | null>(null);

	useEffect(() => {
		// Only show on the root route and only once per session
		if (pathname !== "/") return;
		if (typeof window === "undefined") return;
		const alreadyShown = sessionStorage.getItem("startupVideoShown");
		if (alreadyShown) return;
		// Mark as shown immediately to avoid flicker on route transitions
		sessionStorage.setItem("startupVideoShown", "1");
		setShow(true);

		// Safety timeout in case onended doesn't fire
		timeoutRef.current = window.setTimeout(() => {
			setShow(false);
		}, 8000);

		return () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, [pathname]);

	if (!show) return null;

	return (
		<div
			className="fixed inset-0 z-[1000] bg-black"
			role="dialog"
			aria-label="Startup animation"
		>
			<button
				type="button"
				className="absolute right-4 top-4 z-[1001] rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md"
				onClick={() => setShow(false)}
			>
				Skip
			</button>
			<video
				src="/logo.mp4"
				autoPlay
				playsInline
				muted={canAutoplay}
				onEnded={() => setShow(false)}
				onError={() => setShow(false)}
				className="h-full w-full object-cover"
			/>
		</div>
	);
} 
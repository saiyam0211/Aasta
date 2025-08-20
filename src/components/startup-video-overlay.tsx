"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function StartupVideoOverlay() {
	const pathname = usePathname();
	const [show, setShow] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const timeoutRef = useRef<number | null>(null);

	useEffect(() => {
		// Show immediately for PWA launches
		if (typeof window === "undefined") return;
		
		// Check if this is a PWA launch (standalone mode)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		const isIOSStandalone = (window.navigator as any).standalone === true;
		const isPWALaunch = isStandalone || isIOSStandalone;
		
		// For PWA launches, always show the video immediately
		// For browser visits, show only once per session on root route
		if (isPWALaunch) {
			setShow(true);
		} else if (pathname === "/") {
			const alreadyShown = sessionStorage.getItem("startupVideoShown");
			if (!alreadyShown) {
				sessionStorage.setItem("startupVideoShown", "1");
				setShow(true);
			}
		}

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

	useEffect(() => {
		if (show && videoRef.current) {
			// Ensure video starts playing immediately
			videoRef.current.play().catch((error) => {
				console.log('Video autoplay failed:', error);
				// If autoplay fails, still show the video but user may need to tap
			});
		}
	}, [show]);

	// Show immediately for PWA launches
	if (typeof window !== "undefined") {
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		const isIOSStandalone = (window.navigator as any).standalone === true;
		const isPWALaunch = isStandalone || isIOSStandalone;
		
		if (isPWALaunch && !show) {
			setShow(true);
		}
	}

	if (!show) return null;

	return (
		<div
			className="startup-video-overlay fixed inset-0 z-[1000] bg-black"
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
				ref={videoRef}
				src="/logo.mp4"
				autoPlay
				playsInline
				muted
				onEnded={() => setShow(false)}
				onError={() => setShow(false)}
				className="h-full w-full object-cover"
			/>
		</div>
	);
} 
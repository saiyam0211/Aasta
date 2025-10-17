'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { tryHandleBack } from '@/lib/back-channel';

const STACK_KEY = 'aasta_nav_stack_v1';

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-50)));
  } catch {}
}

export default function BackHandler() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  // Track route changes in a lightweight stack
  useEffect(() => {
    const url = search?.toString()
      ? `${pathname}?${search.toString()}`
      : pathname || '/';
    const stack = readStack();
    if (stack[stack.length - 1] !== url) {
      stack.push(url);
      writeStack(stack);
    }
  }, [pathname, search]);

  // Handle native Android back button inside Capacitor
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Use proxy to avoid importing @capacitor/app directly on web
    const App: any = registerPlugin('App');
    const remove = App.addListener('backButton', async () => {
      // Give page-level override a chance first
      const handled = await tryHandleBack();
      if (handled) return;
      const stack = readStack();
      if (stack.length > 1) {
        // Pop current and navigate to previous
        stack.pop();
        const target = stack[stack.length - 1] || '/';
        writeStack(stack);
        router.push(target);
      } else {
        try {
          await App.exitApp();
        } catch {}
      }
    });
    return () => {
      try {
        remove?.remove?.();
      } catch {}
    };
  }, [router]);

  return null;
}



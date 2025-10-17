'use client';

export type BackOverrideHandler = () => boolean | Promise<boolean>;

let currentHandler: BackOverrideHandler | null = null;

export function setBackOverride(handler: BackOverrideHandler | null) {
  currentHandler = handler;
}

export async function tryHandleBack(): Promise<boolean> {
  if (!currentHandler) return false;
  try {
    const result = await currentHandler();
    return !!result;
  } catch {
    return false;
  }
}



export interface CachedEntry<T> {
  data: T;
  updatedAt: number; // epoch ms
  etag?: string;
}

export function readCache<T>(key: string): CachedEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry<T>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, entry: CachedEntry<T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export async function fetchEtag(etagEndpoint: string): Promise<string | null> {
  try {
    const res = await fetch(etagEndpoint, { cache: 'no-store' });
    if (!res.ok) return null;
    const { etag } = await res.json();
    return typeof etag === 'string' ? etag : null;
  } catch {
    return null;
  }
}

export async function staleWhileRevalidate<T>(
  key: string,
  getFreshData: () => Promise<T>,
  opts?: { etagEndpoint?: string; currentEtag?: string | null }
): Promise<{ cached: T | null; fresh: T | null; usedCache: boolean }> {
  const cached = readCache<T>(key);
  let shouldRefresh = true;
  if (opts?.etagEndpoint) {
    const latestEtag = await fetchEtag(opts.etagEndpoint);
    const same = latestEtag && cached?.etag && latestEtag === cached.etag;
    shouldRefresh = !same;
  }
  if (!shouldRefresh && cached) {
    return { cached: cached.data, fresh: null, usedCache: true };
  }
  const freshData = await getFreshData();
  writeCache<T>(key, {
    data: freshData,
    updatedAt: Date.now(),
    etag: opts?.currentEtag || (await fetchEtag(opts?.etagEndpoint || '')) || cached?.etag,
  });
  return { cached: cached?.data || null, fresh: freshData, usedCache: !!cached };
}



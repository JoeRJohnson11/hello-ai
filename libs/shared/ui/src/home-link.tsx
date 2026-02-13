'use client';

import { useEffect, useState } from 'react';

const LOCAL_LANDING_PORT = 3011;
const FALLBACK_LANDING_URL = 'https://hello-ai-landing-page.vercel.app';

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function HomeLink() {
  const [url, setUrl] = useState(
    () =>
      process.env.NEXT_PUBLIC_LANDING_PAGE_URL || FALLBACK_LANDING_URL
  );

  useEffect(() => {
    const w = typeof globalThis !== 'undefined' && 'location' in globalThis
      ? (globalThis as unknown as { location: { hostname: string } }).location
      : null;
    if (w && isLocalHost(w.hostname)) {
      setUrl(`http://${w.hostname}:${LOCAL_LANDING_PORT}`);
    }
  }, []);

  return (
    <a
      href={url}
      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
    >
      <span aria-hidden>⌂</span>
      Home
    </a>
  );
}

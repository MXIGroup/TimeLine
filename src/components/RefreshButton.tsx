'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/refresh/${postId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setMsg(`Refreshed via ${data.source ?? data.status}`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={go} disabled={busy} className="btn-secondary disabled:opacity-60">
        {busy ? 'Refreshing…' : 'Refresh now'}
      </button>
      {msg && <div className="text-xs text-gray-500">{msg}</div>}
    </div>
  );
}

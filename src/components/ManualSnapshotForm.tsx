'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManualSnapshotForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [vals, setVals] = useState({
    views: '', impressions: '', reach: '',
    likes: '', comments: '', shares: '', saves: '',
    watch_time_s: '', follower_count: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (k: keyof typeof vals) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = Object.fromEntries(
        Object.entries(vals)
          .filter(([, v]) => v !== '')
          .map(([k, v]) => [k, Number(v)]),
      );
      const res = await fetch(`/api/snapshots`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ post_id: postId, ...body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed');
      }
      setVals({ views: '', impressions: '', reach: '', likes: '', comments: '', shares: '', saves: '', watch_time_s: '', follower_count: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(['views','impressions','reach','likes','comments','shares','saves','watch_time_s','follower_count'] as const).map((k) => (
          <div key={k}>
            <label className="label text-xs">{k.replace(/_/g, ' ')}</label>
            <input type="number" min="0" className="input" value={vals[k]} onChange={onChange(k)} />
          </div>
        ))}
      </div>
      {error && <div className="text-sm text-red-700">{error}</div>}
      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? 'Saving…' : 'Save snapshot'}
      </button>
    </form>
  );
}

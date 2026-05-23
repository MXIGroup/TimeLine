'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { detectPlatform } from '@/lib/platforms';

interface Option { id: string; name: string }
interface Campaign extends Option { client_id: string }

export default function PostForm({
  clients,
  campaigns,
  creators,
}: {
  clients: Option[];
  campaigns: Campaign[];
  creators: Option[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [clientId, setClientId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [deliverable, setDeliverable] = useState('reel');
  const [postedAt, setPostedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [trackingLinkUsed, setTrackingLinkUsed] = useState<'yes' | 'no' | ''>('');
  const [trackingLinkUrl, setTrackingLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detection = useMemo(() => (url ? detectPlatform(url) : null), [url]);

  const filteredCampaigns = useMemo(
    () => (clientId ? campaigns.filter((c) => c.client_id === clientId) : campaigns),
    [clientId, campaigns],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          post_url: url,
          creator_id: creatorId || undefined,
          creator_name: creatorId ? undefined : creatorName,
          client_id: clientId,
          campaign_id: campaignId || undefined,
          campaign_name: campaignId ? undefined : campaignName,
          deliverable,
          posted_at: new Date(postedAt).toISOString(),
          tracking_link_used: trackingLinkUsed === 'yes' ? true : trackingLinkUsed === 'no' ? false : null,
          tracking_link_url: trackingLinkUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create post');
      router.push(`/posts/${data.post_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-5">
      <div>
        <label className="label">Post URL</label>
        <input
          className="input"
          placeholder="https://www.tiktok.com/@user/video/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        {detection && (
          <div className="text-xs text-gray-600 mt-1">
            Detected platform: <span className="font-medium">{detection.platform}</span>
            {detection.external_post_id && <> · id <code>{detection.external_post_id}</code></>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Client</label>
          <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Select…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Campaign</label>
          <select className="input" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">— New campaign —</option>
            {filteredCampaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!campaignId && (
            <input
              className="input mt-2"
              placeholder="New campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required={!campaignId}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Creator</label>
          <select className="input" value={creatorId} onChange={(e) => setCreatorId(e.target.value)}>
            <option value="">— New creator —</option>
            {creators.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!creatorId && (
            <input
              className="input mt-2"
              placeholder="New creator name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              required={!creatorId}
            />
          )}
        </div>
        <div>
          <label className="label">Deliverable type</label>
          <select className="input" value={deliverable} onChange={(e) => setDeliverable(e.target.value)}>
            {['in_feed_video','reel','short','long_form_video','story','static_post','carousel','tweet','live','watchalong','match_preview','social_clip','other'].map((d) =>
              <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Post date / time</label>
          <input type="datetime-local" className="input" value={postedAt} onChange={(e) => setPostedAt(e.target.value)} required />
        </div>
        <div>
          <label className="label">Tracking link used?</label>
          <select className="input" value={trackingLinkUsed} onChange={(e) => setTrackingLinkUsed(e.target.value as 'yes' | 'no' | '')}>
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      {trackingLinkUsed === 'yes' && (
        <div>
          <label className="label">Tracking link URL (UTM / affiliate / btag)</label>
          <input className="input" value={trackingLinkUrl} onChange={(e) => setTrackingLinkUrl(e.target.value)} />
        </div>
      )}

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? 'Saving…' : 'Save post'}
        </button>
      </div>
    </form>
  );
}

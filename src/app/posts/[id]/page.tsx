import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import ManualSnapshotForm from '@/components/ManualSnapshotForm';
import RefreshButton from '@/components/RefreshButton';

export const dynamic = 'force-dynamic';

interface Params { id: string }

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const db = await supabaseServer();
  const { data: post } = await db.from('posts').select('*, creators(name), campaigns(name, client_id, clients(name, slug, template_key))').eq('id', id).single();
  if (!post) notFound();

  const { data: snapshots } = await db
    .from('post_metric_snapshots')
    .select('*')
    .eq('post_id', id)
    .order('captured_at', { ascending: false });

  const { data: schedule } = await db
    .from('post_refresh_schedule')
    .select('*')
    .eq('post_id', id)
    .order('scheduled_for', { ascending: true });

  const creator = (post as { creators: { name: string } | null }).creators?.name;
  const campaign = (post as { campaigns: { name: string; clients: { name: string } | null } | null }).campaigns;
  const client = campaign?.clients?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{creator} · {campaign?.name}</h1>
          <p className="text-sm text-gray-600">{client} · {post.platform} · {post.deliverable}</p>
          <a href={post.post_url} target="_blank" rel="noreferrer" className="text-mxi-accent text-sm">{post.post_url} ↗</a>
        </div>
        <RefreshButton postId={post.id} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Views" value={post.latest_views} />
        <Stat label="Likes" value={post.latest_likes} />
        <Stat label="Comments" value={post.latest_comments} />
        <Stat label="Shares" value={post.latest_shares} />
        <Stat label="Saves" value={post.latest_saves} />
        <Stat label="Engagement %" value={post.latest_engagement_rate} suffix="%" />
        <Stat label="Watch time (s)" value={post.latest_watch_time_s} />
        <Stat label="Reach" value={post.latest_reach} />
        <Stat label="Impressions" value={post.latest_impressions} />
        <Stat label="Last refresh" value={post.latest_snapshot_at ? new Date(post.latest_snapshot_at).toLocaleString() : 'never'} raw />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-5 space-y-3">
          <h2 className="font-semibold">Manual snapshot</h2>
          <p className="text-sm text-gray-600">
            Use when the platform doesn't have an API connection yet, or to override values from a creator screenshot.
          </p>
          <ManualSnapshotForm postId={post.id} />
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">Refresh schedule</h2>
          <ul className="text-sm space-y-2">
            {(schedule ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <div className="font-medium">{s.reason}</div>
                  <div className="text-gray-500 text-xs">{new Date(s.scheduled_for).toLocaleString()}</div>
                </div>
                <div className="text-xs">
                  {s.completed_at ? <span className="tag-live">Done</span> : <span className="tag-requested">Pending</span>}
                </div>
              </li>
            ))}
            {!schedule?.length && <li className="text-gray-500">No refreshes scheduled.</li>}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">Snapshot history</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1">When</th>
                <th className="px-2 py-1">Source</th>
                <th className="px-2 py-1">Reason</th>
                <th className="px-2 py-1 text-right">Views</th>
                <th className="px-2 py-1 text-right">Likes</th>
                <th className="px-2 py-1 text-right">Comments</th>
                <th className="px-2 py-1 text-right">ER %</th>
              </tr>
            </thead>
            <tbody>
              {(snapshots ?? []).map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="px-2 py-1 whitespace-nowrap">{new Date(s.captured_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{s.source}</td>
                  <td className="px-2 py-1">{s.refresh_reason}</td>
                  <td className="px-2 py-1 text-right">{fmt(s.views)}</td>
                  <td className="px-2 py-1 text-right">{fmt(s.likes)}</td>
                  <td className="px-2 py-1 text-right">{fmt(s.comments)}</td>
                  <td className="px-2 py-1 text-right">{s.engagement_rate ?? '—'}</td>
                </tr>
              ))}
              {!snapshots?.length && (
                <tr><td colSpan={7} className="px-2 py-4 text-center text-gray-500">No snapshots yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix, raw }: { label: string; value: unknown; suffix?: string; raw?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-xl font-semibold mt-1">
        {value == null ? '—' : raw ? String(value) : new Intl.NumberFormat().format(Number(value))}
        {suffix && value != null ? suffix : ''}
      </div>
    </div>
  );
}
function fmt(n: number | null | undefined) {
  return n == null ? '—' : new Intl.NumberFormat().format(n);
}

import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = await supabaseServer();
  const { data: rows } = await db
    .from('v_posts_for_sheet')
    .select('*')
    .order('post_date', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-gray-600 text-sm">Latest snapshot per post. Click through to see history.</p>
        </div>
        <Link href="/posts/new" className="btn-primary">+ Add Post</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2">Creator</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Platform</th>
              <th className="px-4 py-2">Posted</th>
              <th className="px-4 py-2 text-right">Views</th>
              <th className="px-4 py-2 text-right">ER %</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Last refresh</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.post_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">{r.creator}</td>
                <td className="px-4 py-2">{r.client}</td>
                <td className="px-4 py-2">{r.campaign}</td>
                <td className="px-4 py-2">{r.platform}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(r.post_date)}</td>
                <td className="px-4 py-2 text-right">{fmtNumber(r.views)}</td>
                <td className="px-4 py-2 text-right">{r.engagement_rate ?? '—'}</td>
                <td className="px-4 py-2"><StatusTag status={r.status} /></td>
                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{r.snapshot_date ? formatDate(r.snapshot_date) : 'never'}</td>
              </tr>
            ))}
            {!rows?.length && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No posts yet. <Link href="/posts/new" className="text-mxi-accent">Add your first one.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtNumber(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat().format(n);
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function StatusTag({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    live:         ['🟢 Live',        'tag-live'],
    in_progress:  ['🟡 In Progress', 'tag-in-progress'],
    requested:    ['⏳ Requested',    'tag-requested'],
    archived:     ['Archived',       'tag-archived'],
  };
  const [label, cls] = map[status] ?? [status, 'tag-requested'];
  return <span className={cls}>{label}</span>;
}

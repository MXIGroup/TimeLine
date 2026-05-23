import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const db = await supabaseServer();
  const { data: campaigns } = await db
    .from('campaigns')
    .select('id, name, starts_on, ends_on, clients(name, slug)')
    .order('name');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Campaigns</h1>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Starts</th>
              <th className="px-4 py-2">Ends</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns ?? []).map((c) => {
              const client = (c as { clients: { name: string } | null }).clients;
              return (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">{client?.name}</td>
                  <td className="px-4 py-2">{c.starts_on ?? '—'}</td>
                  <td className="px-4 py-2">{c.ends_on ?? '—'}</td>
                </tr>
              );
            })}
            {!campaigns?.length && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No campaigns yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

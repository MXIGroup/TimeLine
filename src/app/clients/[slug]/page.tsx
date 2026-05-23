import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { getClientTemplate } from '@/lib/clients/templates';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await supabaseServer();
  const { data: client } = await db.from('clients').select('*').eq('slug', slug).single();
  if (!client) notFound();
  const tmpl = getClientTemplate(client.template_key);

  const { data: campaigns } = await db
    .from('campaigns')
    .select('id, name, starts_on, ends_on')
    .eq('client_id', client.id)
    .order('starts_on', { ascending: false, nullsFirst: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="text-sm text-gray-600">
          Template: {tmpl.label} · Cadence: {tmpl.cadence} · Currency: {tmpl.default_currency}
        </p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold mb-2">Reporting priorities</h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {tmpl.priority_metrics.map((m) => <li key={m}>{m.replace(/_/g, ' ')}</li>)}
        </ul>
        {tmpl.compliance_checks.length > 0 && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Compliance checks</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {tmpl.compliance_checks.map((c) => <li key={c.key}>{c.label}</li>)}
            </ul>
          </>
        )}
        {tmpl.benchmarks && (
          <>
            <h3 className="font-semibold mt-4 mb-2">View benchmarks</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {Object.entries(tmpl.benchmarks).map(([k, v]) =>
                <li key={k}>{k.replace(/_/g, ' ')}: {new Intl.NumberFormat().format(v)}</li>,
              )}
            </ul>
          </>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Campaigns</h2>
          <SyncButton slug={slug} />
        </div>
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2">Campaign</th>
                <th className="px-4 py-2">Starts</th>
                <th className="px-4 py-2">Ends</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns ?? []).map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">{c.starts_on ?? '—'}</td>
                  <td className="px-4 py-2">{c.ends_on ?? '—'}</td>
                </tr>
              ))}
              {!campaigns?.length && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-500">No campaigns yet for {client.name}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Link href="/clients" className="text-sm text-gray-500">← All clients</Link>
    </div>
  );
}

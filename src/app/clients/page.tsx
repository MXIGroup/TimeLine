import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase';
import { getClientTemplate } from '@/lib/clients/templates';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const db = await supabaseServer();
  const { data: clients } = await db.from('clients').select('*').order('name');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(clients ?? []).map((c) => {
          const tmpl = getClientTemplate(c.template_key);
          return (
            <Link key={c.id} href={`/clients/${c.slug}`} className="card p-5 block hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{c.name}</div>
                <span className="tag-requested">{tmpl.cadence}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Template: {tmpl.label}</div>
              <div className="text-xs text-gray-500 mt-2">
                Priority: {tmpl.priority_metrics.join(', ')}
              </div>
            </Link>
          );
        })}
        {!clients?.length && (
          <div className="text-gray-500">No clients yet. Run <code>supabase/seed.sql</code> to load the defaults.</div>
        )}
      </div>
    </div>
  );
}

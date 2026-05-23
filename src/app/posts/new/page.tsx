import { supabaseServer } from '@/lib/supabase';
import PostForm from '@/components/PostForm';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const db = await supabaseServer();
  const [clientsRes, campaignsRes, creatorsRes] = await Promise.all([
    db.from('clients').select('id, name, slug').order('name'),
    db.from('campaigns').select('id, name, client_id').order('name'),
    db.from('creators').select('id, name').order('name'),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add post</h1>
        <p className="text-gray-600 text-sm">
          Paste the URL — we'll detect the platform. Tag it with the campaign and we'll seed the
          24h / 48h / 7d refreshes automatically.
        </p>
      </div>
      <PostForm
        clients={clientsRes.data ?? []}
        campaigns={campaignsRes.data ?? []}
        creators={creatorsRes.data ?? []}
      />
    </div>
  );
}

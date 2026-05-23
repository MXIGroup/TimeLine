import { NextResponse } from 'next/server';
import { z } from 'zod';
import { detectPlatform } from '@/lib/platforms';
import { supabaseServer } from '@/lib/supabase';
import { refreshPost } from '@/lib/snapshots/refresh';

const Body = z.object({
  post_url: z.string().url(),
  client_id: z.string().uuid(),
  campaign_id: z.string().uuid().optional(),
  campaign_name: z.string().min(1).optional(),
  creator_id: z.string().uuid().optional(),
  creator_name: z.string().min(1).optional(),
  deliverable: z.string(),
  posted_at: z.string().datetime(),
  tracking_link_used: z.boolean().nullable(),
  tracking_link_url: z.string().url().nullable().optional(),
}).refine((b) => b.campaign_id || b.campaign_name, { message: 'campaign_id or campaign_name required' })
  .refine((b) => b.creator_id || b.creator_name, { message: 'creator_id or creator_name required' });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const db = await supabaseServer();

  // Resolve / create creator
  let creator_id = body.creator_id;
  if (!creator_id && body.creator_name) {
    const { data, error } = await db
      .from('creators')
      .upsert({ name: body.creator_name }, { onConflict: 'name' })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    creator_id = data.id;
  }

  // Resolve / create campaign
  let campaign_id = body.campaign_id;
  if (!campaign_id && body.campaign_name) {
    const { data, error } = await db
      .from('campaigns')
      .upsert(
        { name: body.campaign_name, client_id: body.client_id },
        { onConflict: 'client_id,name' },
      )
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    campaign_id = data.id;
  }

  const detection = detectPlatform(body.post_url);

  const { data: post, error } = await db
    .from('posts')
    .insert({
      campaign_id,
      creator_id,
      platform: detection.platform,
      deliverable: body.deliverable,
      post_url: detection.normalised_url,
      external_post_id: detection.external_post_id,
      posted_at: body.posted_at,
      status: 'in_progress',
      tracking_link_used: body.tracking_link_used,
      tracking_link_url: body.tracking_link_url ?? null,
    })
    .select('*')
    .single();

  if (error || !post) {
    return NextResponse.json({ error: error?.message ?? 'insert failed' }, { status: 400 });
  }

  // Try an immediate refresh if the provider is wired up. Fire-and-forget
  // semantics — failure here doesn't block post creation.
  try {
    await refreshPost(post, 'manual');
  } catch (err) {
    console.error('immediate refresh failed', err);
  }

  return NextResponse.json({ post_id: post.id, platform: detection.platform });
}

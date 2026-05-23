import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { refreshPost } from '@/lib/snapshots/refresh';
import type { Post } from '@/types/db';

const Body = z.object({
  post_id: z.string().uuid(),
  views: z.number().int().nonnegative().optional(),
  impressions: z.number().int().nonnegative().optional(),
  reach: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  saves: z.number().int().nonnegative().optional(),
  watch_time_s: z.number().int().nonnegative().optional(),
  follower_count: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { post_id, ...metrics } = parsed.data;

  const db = await supabaseServer();
  const { data: post } = await db.from('posts').select('*').eq('id', post_id).single();
  if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 });

  const result = await refreshPost(post as Post, 'manual', { source: 'manual', ...metrics });
  return NextResponse.json(result);
}

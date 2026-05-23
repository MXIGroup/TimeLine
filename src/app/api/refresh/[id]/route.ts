import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { refreshPost } from '@/lib/snapshots/refresh';
import type { Post } from '@/types/db';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await supabaseServer();
  const { data: post } = await db.from('posts').select('*').eq('id', id).single();
  if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 });
  const result = await refreshPost(post as Post, 'manual');
  return NextResponse.json(result);
}

import { NextResponse } from 'next/server';
import { runDueRefreshes } from '@/lib/snapshots/refresh';

// Called by your scheduler (Vercel Cron, GitHub Actions, Supabase pg_cron, etc.)
// every ~15 minutes. Configure the schedule in vercel.json or your platform's
// equivalent. The caller must include  Authorization: Bearer <CRON_SECRET>
// so a stranger can't trigger the worker.

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return NextResponse.json({ error: 'CRON_SECRET not set' }, { status: 500 });
  const got = req.headers.get('authorization');
  if (got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await runDueRefreshes(100);
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  // Vercel Cron uses GET. Accept either.
  return POST(req);
}

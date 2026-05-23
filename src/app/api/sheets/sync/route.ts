import { NextResponse } from 'next/server';
import { z } from 'zod';
import { syncToSheet } from '@/lib/sheets/sync';

const Body = z.object({
  sheet_id: z.string().optional(),
  tab_name: z.string().optional(),
  client_slug: z.string().optional(),
  campaign_id: z.string().uuid().optional(),
}).default({});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const result = await syncToSheet(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

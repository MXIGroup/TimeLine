import { google, sheets_v4 } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

// Columns match the spec in the brief, in order:
//   Creator | Post # | Campaign | Client | Post Date | Platform |
//   Deliverable Type | Post URL | Views | Watch Time | Likes | Saves |
//   Comments | Shares | Engagement Rate (%) | Audience Gender |
//   Audience Age | Audience Location | Tracking Link Used |
//   Snapshot Date | Status
const HEADERS = [
  'Creator',
  'Post #',
  'Campaign',
  'Client',
  'Post Date',
  'Platform',
  'Deliverable Type',
  'Post URL',
  'Views',
  'Watch Time (s)',
  'Likes',
  'Saves',
  'Comments',
  'Shares',
  'Engagement Rate (%)',
  'Audience Gender',
  'Audience Age',
  'Audience Location',
  'Tracking Link Used',
  'Snapshot Date',
  'Status',
];

function sheetsClient(): sheets_v4.Sheets {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

interface SyncOptions {
  sheet_id?: string;       // override env default
  tab_name?: string;       // defaults to the client slug, or 'All'
  client_slug?: string;    // filter rows to one client
  campaign_id?: string;    // or to one campaign
}

export async function syncToSheet(opts: SyncOptions = {}) {
  const sheets = sheetsClient();
  const spreadsheetId = opts.sheet_id ?? process.env.GOOGLE_SHEETS_TRACKER_ID;
  if (!spreadsheetId) throw new Error('No GOOGLE_SHEETS_TRACKER_ID and no sheet_id passed');

  const tab = opts.tab_name ?? opts.client_slug ?? 'All';

  const db = supabaseAdmin();
  let q = db.from('v_posts_for_sheet').select('*').order('post_date', { ascending: true });
  if (opts.campaign_id) q = q.eq('post_id', opts.campaign_id);
  // The view exposes client name; for a slug filter we resolve to a name first.
  if (opts.client_slug) {
    const { data: client } = await db
      .from('clients')
      .select('name')
      .eq('slug', opts.client_slug)
      .single();
    if (client?.name) q = q.eq('client', client.name);
  }
  const { data: rows, error } = await q;
  if (error) throw error;

  const values: (string | number | null)[][] = [HEADERS];
  for (const r of rows ?? []) {
    values.push([
      r.creator,
      r.post_number,
      r.campaign,
      r.client,
      r.post_date,
      r.platform,
      r.deliverable_type,
      r.post_url,
      r.views ?? '',
      r.watch_time_s ?? '',
      r.likes ?? '',
      r.saves ?? '',
      r.comments ?? '',
      r.shares ?? '',
      r.engagement_rate ?? '',
      formatDemo(r.audience_gender),
      formatDemo(r.audience_age),
      formatTopList(r.audience_location),
      r.tracking_link_used == null ? '' : r.tracking_link_used ? 'Yes' : 'No',
      r.snapshot_date ?? '',
      r.status,
    ]);
  }

  await ensureTab(sheets, spreadsheetId, tab);

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${tab}!A:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  await db.from('sheet_sync_log').insert({
    sheet_id: spreadsheetId,
    sheet_tab: tab,
    rows_written: values.length - 1,
    status: 'ok',
    finished_at: new Date().toISOString(),
  });

  return { rows_written: values.length - 1, tab };
}

async function ensureTab(sheets: sheets_v4.Sheets, spreadsheetId: string, tab: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tab);
  if (exists) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tab } } }],
    },
  });
}

function formatDemo(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  return Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toFixed(1) + '%' : v}`)
    .join(', ');
}

function formatTopList(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .slice(0, 5)
    .map((entry) => {
      const e = entry as { code?: string; name?: string; pct?: number };
      const label = e.name ?? e.code ?? '';
      return e.pct != null ? `${label} ${e.pct.toFixed(1)}%` : label;
    })
    .join(', ');
}

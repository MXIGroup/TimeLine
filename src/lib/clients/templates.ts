import type { Platform } from '@/types/db';

/** A client template controls which metrics are surfaced first, which
 *  compliance checks the dashboard flags, what cadence the reporting
 *  cron runs at, and what the PDF/deck layout emphasises. */
export interface ClientTemplate {
  key: string;
  label: string;
  priority_metrics: string[];          // shown above the fold in reports
  compliance_checks: ComplianceCheck[];
  cadence: 'weekly' | 'biweekly' | 'post_campaign';
  default_currency: string;
  // Per-deliverable view benchmarks; reporting marks each post against these
  benchmarks?: Record<string, number>;
  // Which audience geographies the client cares about (eg ['GB'] for Zilch,
  // ['GB','IE'] for BoyleSports) — used for "% in-target audience" widgets
  target_geos?: string[];
  // Output format flags
  outputs: {
    google_sheet: boolean;
    weekly_email: boolean;
    pdf_deck: boolean;
    screenshot_led: boolean;
  };
}

export interface ComplianceCheck {
  key: string;
  label: string;
  /** Returns true if the post passes the check, false if it fails,
   *  null if there isn't enough data to evaluate yet. */
  evaluate: (ctx: ComplianceContext) => boolean | null;
}

export interface ComplianceContext {
  tracking_link_used: boolean | null;
  screenshot_uploaded: boolean;
  posted_at: string;
  platform: Platform;
  audience_geo_pct?: Record<string, number>;  // {'GB': 58.2, ...}
  hours_since_post?: number;
}

// ─── Templates ──────────────────────────────────────────────────────────────

const trackingLinkCheck: ComplianceCheck = {
  key: 'tracking_link_used',
  label: 'Tracking link / UTM / affiliate code used correctly',
  evaluate: (c) => c.tracking_link_used,
};

const screenshotWithin48h: ComplianceCheck = {
  key: 'screenshot_within_48h',
  label: 'Screenshot evidence uploaded within 48 hours',
  evaluate: (c) => {
    if (c.hours_since_post == null) return null;
    if (c.hours_since_post < 48) return c.screenshot_uploaded || null;
    return c.screenshot_uploaded;
  },
};

const audienceGeoCheck = (geos: string[], minPct: number): ComplianceCheck => ({
  key: `audience_geo_${geos.join('_').toLowerCase()}`,
  label: `${geos.join(' / ')} audience ≥ ${minPct}%`,
  evaluate: (c) => {
    if (!c.audience_geo_pct) return null;
    const total = geos.reduce((sum, g) => sum + (c.audience_geo_pct?.[g] ?? 0), 0);
    return total >= minPct;
  },
});

const TEMPLATES: Record<string, ClientTemplate> = {
  zilch: {
    key: 'zilch',
    label: 'Zilch',
    priority_metrics: ['saves', 'engagement_rate', 'audience_geo_gb', 'tracking_link_used'],
    compliance_checks: [trackingLinkCheck, audienceGeoCheck(['GB'], 70)],
    cadence: 'weekly',
    default_currency: 'GBP',
    target_geos: ['GB'],
    outputs: { google_sheet: true, weekly_email: true, pdf_deck: false, screenshot_led: false },
  },

  boylesports: {
    key: 'boylesports',
    label: 'BoyleSports',
    priority_metrics: ['views', 'audience_geo_gb_ie', 'tracking_link_used'],
    compliance_checks: [trackingLinkCheck, audienceGeoCheck(['GB', 'IE'], 70)],
    cadence: 'weekly',
    default_currency: 'GBP',
    target_geos: ['GB', 'IE'],
    benchmarks: {
      watchalong: 300_000,
      match_preview: 200_000,
      social_clip: 80_000,
    },
    outputs: { google_sheet: true, weekly_email: false, pdf_deck: true, screenshot_led: false },
  },

  ea_xbox: {
    key: 'ea_xbox',
    label: 'EA Sports / Xbox',
    priority_metrics: ['impressions', 'reach', 'engagement_rate', 'screenshot_uploaded'],
    compliance_checks: [screenshotWithin48h],
    cadence: 'post_campaign',
    default_currency: 'USD',
    // Brand exclusivity check evaluated against campaigns.exclusivity_window
    // at report-generation time; not modelled here.
    outputs: { google_sheet: true, weekly_email: false, pdf_deck: true, screenshot_led: true },
  },

  hyperice: {
    key: 'hyperice',
    label: 'Hyperice',
    priority_metrics: ['views', 'reach', 'engagement_rate'],
    compliance_checks: [],
    cadence: 'biweekly',
    default_currency: 'USD',
    outputs: { google_sheet: true, weekly_email: false, pdf_deck: true, screenshot_led: false },
  },

  general: {
    key: 'general',
    label: 'General (Opera / HelloFresh / Other)',
    priority_metrics: ['views', 'engagement_rate', 'audience_breakdown'],
    compliance_checks: [],
    cadence: 'post_campaign',
    default_currency: 'GBP',
    outputs: { google_sheet: true, weekly_email: false, pdf_deck: true, screenshot_led: false },
  },
};

export function getClientTemplate(key: string | null | undefined): ClientTemplate {
  return TEMPLATES[key ?? ''] ?? TEMPLATES.general;
}

export function listClientTemplates(): ClientTemplate[] {
  return Object.values(TEMPLATES);
}

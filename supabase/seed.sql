-- Seed clients matching the briefs in docs/CLIENT_TEMPLATES.md
insert into clients (name, slug, template_key, default_currency, reporting_cadence) values
  ('Zilch',         'zilch',        'zilch',        'GBP', 'weekly'),
  ('BoyleSports',   'boylesports',  'boylesports',  'GBP', 'weekly'),
  ('EA Sports',     'ea',           'ea_xbox',      'USD', 'post_campaign'),
  ('Xbox',          'xbox',         'ea_xbox',      'USD', 'post_campaign'),
  ('Hyperice',      'hyperice',     'hyperice',     'USD', 'biweekly'),
  ('Opera',         'opera',        'general',      'EUR', 'post_campaign'),
  ('HelloFresh',    'hellofresh',   'general',      'GBP', 'post_campaign')
on conflict (slug) do nothing;

-- BoyleSports benchmark seeds (per docs/CLIENT_TEMPLATES.md)
update campaigns set benchmark_config = jsonb_build_object(
  'watchalong_views',     300000,
  'match_preview_views',  200000,
  'social_clip_views',     80000
)
where client_id = (select id from clients where slug = 'boylesports')
  and benchmark_config = '{}'::jsonb;

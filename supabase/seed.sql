-- Seed plan_config avec les valeurs free/pro
INSERT INTO plan_config (plan, feature_key, feature_value) VALUES
  ('free', 'ia_enabled',                   'false'),
  ('free', 'analytics_range_months',       '3'),
  ('free', 'export_csv_enabled',           'true'),
  ('free', 'export_zip_enabled',           'true'),
  ('free', 'module_cycle_enabled',         'true'),
  ('free', 'module_sport_enabled',         'true'),
  ('free', 'module_transport_enabled',     'true'),
  ('free', 'module_charge_mentale_enabled','true'),
  ('free', 'module_daily_pain_enabled',    'true'),
  ('free', 'pdf_report_enabled',           'true'),
  ('free', 'vocal_input_enabled',          'true'),
  ('free', 'max_profiles',                '1'),
  ('pro',  'ia_enabled',                   'true'),
  ('pro',  'analytics_range_months',       '0'),
  ('pro',  'export_csv_enabled',           'true'),
  ('pro',  'export_zip_enabled',           'true'),
  ('pro',  'module_cycle_enabled',         'true'),
  ('pro',  'module_sport_enabled',         'true'),
  ('pro',  'module_transport_enabled',     'true'),
  ('pro',  'module_charge_mentale_enabled','true'),
  ('pro',  'module_daily_pain_enabled',    'true'),
  ('pro',  'pdf_report_enabled',           'true'),
  ('pro',  'vocal_input_enabled',          'true'),
  ('pro',  'max_profiles',                '3')
ON CONFLICT (plan, feature_key) DO UPDATE SET
  feature_value = EXCLUDED.feature_value,
  updated_at = NOW();

-- ============================================================
-- E34 — Ajout des modules manquants dans plan_config
-- Alimentation, Traitements, Consultations, Environnement,
-- Profil médical, Patterns, Alertes, Sync mobile
-- ============================================================

INSERT INTO plan_config (plan, feature_key, feature_value) VALUES
  ('free', 'module_alimentaire_enabled',     'true'),
  ('free', 'module_traitements_enabled',     'true'),
  ('free', 'module_consultations_enabled',   'true'),
  ('free', 'module_environnement_enabled',   'true'),
  ('free', 'module_profil_medical_enabled',  'true'),
  ('free', 'module_patterns_enabled',        'true'),
  ('free', 'module_alertes_enabled',         'true'),
  ('free', 'module_mobile_sync_enabled',     'true'),
  ('pro',  'module_alimentaire_enabled',     'true'),
  ('pro',  'module_traitements_enabled',     'true'),
  ('pro',  'module_consultations_enabled',   'true'),
  ('pro',  'module_environnement_enabled',   'true'),
  ('pro',  'module_profil_medical_enabled',  'true'),
  ('pro',  'module_patterns_enabled',        'true'),
  ('pro',  'module_alertes_enabled',         'true'),
  ('pro',  'module_mobile_sync_enabled',     'true')
ON CONFLICT (plan, feature_key) DO NOTHING;

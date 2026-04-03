-- ============================================================
-- E34 — Fix RLS pour upsert sur plan_config
-- L'upsert Supabase nécessite que l'admin puisse SELECT le row
-- existant avant de le mettre à jour (USING sur INSERT policy).
-- On remplace les policies granulaires par une seule policy
-- FOR ALL couvrant INSERT/UPDATE/DELETE pour les admins.
-- ============================================================

-- plan_config : remplacer les policies granulaires par FOR ALL
DROP POLICY IF EXISTS "admin can insert plan_config" ON plan_config;
DROP POLICY IF EXISTS "admin can update plan_config" ON plan_config;
DROP POLICY IF EXISTS "admin can delete plan_config" ON plan_config;
DROP POLICY IF EXISTS "admin full access" ON plan_config;

CREATE POLICY "admin full access" ON plan_config
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- admin_log : la policy existante n'a pas de WITH CHECK → INSERT bloqué
DROP POLICY IF EXISTS "admin full access" ON admin_log;

CREATE POLICY "admin full access" ON admin_log
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- ADMIN — policy d'écriture sur plan_config
-- ============================================================
-- La policy SELECT publique existe déjà (00001).
-- On ajoute INSERT, UPDATE, DELETE pour les admins uniquement.

CREATE POLICY "admin can insert plan_config"
  ON plan_config FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin can update plan_config"
  ON plan_config FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin can delete plan_config"
  ON plan_config FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

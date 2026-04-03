-- ============================================================
-- UTILISATEURS & USAGE
-- ============================================================

CREATE TABLE user_usage (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active_at       TIMESTAMPTZ,
  session_count        INTEGER DEFAULT 0,
  profile_count        INTEGER DEFAULT 0,
  is_active            BOOLEAN DEFAULT TRUE,
  marketing_consent    BOOLEAN DEFAULT FALSE,
  marketing_consent_at TIMESTAMPTZ,
  auth_provider        TEXT    -- 'google' | 'apple' | 'facebook' | 'email' | 'magiclink'
);

CREATE TABLE user_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_local_id UUID NOT NULL,
  label            TEXT NOT NULL,
  color            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLANS & FEATURE FLAGS
-- ============================================================

CREATE TABLE profile_plans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_local_id       UUID NOT NULL,
  plan                   TEXT NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  plan_activated_at      TIMESTAMPTZ,
  plan_expires_at        TIMESTAMPTZ
);

CREATE TABLE plan_config (
  plan          TEXT NOT NULL,
  feature_key   TEXT NOT NULL,
  feature_value TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    UUID REFERENCES auth.users(id),
  PRIMARY KEY (plan, feature_key)
);

-- ============================================================
-- TRANSIT MOBILE
-- ============================================================

CREATE TABLE mobile_transit (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_payload BYTEA NOT NULL,
  iv                BYTEA NOT NULL,
  entry_type        TEXT NOT NULL CHECK (entry_type IN ('crise', 'daily_pain', 'charge_mentale')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  synced_at         TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- ============================================================
-- JOURNAL ADMIN
-- ============================================================

CREATE TABLE admin_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  target_id   UUID,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE user_usage       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_transit   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_log        ENABLE ROW LEVEL SECURITY;

-- plan_config en lecture publique (pas de données sensibles)
CREATE POLICY "anyone can read plan_config"
  ON plan_config FOR SELECT USING (TRUE);

-- Utilisateurs — accès à leurs propres données uniquement
CREATE POLICY "own data only" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON profile_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON mobile_transit
  FOR ALL USING (auth.uid() = user_id);

-- Admins — accès complet journalisé
CREATE POLICY "admin full access" ON user_usage
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin full access" ON user_profiles
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin full access" ON profile_plans
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin full access" ON mobile_transit
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin full access" ON admin_log
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- CRON — purge mobile_transit > 90 jours non synchronisé
-- Nécessite l'extension pg_cron activée dans Database > Extensions
-- ============================================================

-- Décommenter après activation de pg_cron :
-- SELECT cron.schedule(
--   'purge-mobile-transit',
--   '0 3 * * *',
--   $$DELETE FROM mobile_transit
--     WHERE synced_at IS NULL
--     AND created_at < NOW() - INTERVAL '90 days'$$
-- );

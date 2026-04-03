-- ============================================================
-- E36 — Suppression du mode multi-profils
-- Un compte = un profil. La notion de profil intermédiaire
-- (user_profiles / profile_local_id) est supprimée.
-- ============================================================

-- 1. Créer user_plans à partir de profile_plans (sans profile_local_id)
--    On conserve un seul plan par utilisateur (le plus récent).
CREATE TABLE user_plans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                   TEXT NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  plan_activated_at      TIMESTAMPTZ,
  plan_expires_at        TIMESTAMPTZ
);

-- Migrer les données existantes (un seul plan par user, le plus récent)
INSERT INTO user_plans (user_id, plan, stripe_subscription_id, stripe_customer_id, plan_activated_at, plan_expires_at)
SELECT DISTINCT ON (user_id)
  user_id, plan, stripe_subscription_id, stripe_customer_id, plan_activated_at, plan_expires_at
FROM profile_plans
ORDER BY user_id, plan_activated_at DESC NULLS LAST;

-- 2. Supprimer les anciennes tables
DROP TABLE profile_plans;
DROP TABLE user_profiles;

-- 3. Supprimer profile_count de user_usage
ALTER TABLE user_usage DROP COLUMN profile_count;

-- 4. RLS pour user_plans
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own data only" ON user_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin full access" ON user_plans
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5. Mettre à jour la fonction admin get_admin_user_list
DROP FUNCTION IF EXISTS get_admin_user_list();
CREATE OR REPLACE FUNCTION get_admin_user_list()
RETURNS TABLE (
  user_id          UUID,
  email_masked     TEXT,
  email_full       TEXT,
  created_at       TIMESTAMPTZ,
  last_active_at   TIMESTAMPTZ,
  session_count    INTEGER,
  is_active        BOOLEAN,
  auth_provider    TEXT,
  plan             TEXT,
  marketing_consent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  RETURN QUERY
  SELECT
    au.id AS user_id,
    CONCAT(LEFT(au.email::text, 1), '***@', SPLIT_PART(au.email::text, '@', 2))::text AS email_masked,
    au.email::text AS email_full,
    au.created_at,
    uu.last_active_at,
    COALESCE(uu.session_count, 0) AS session_count,
    COALESCE(uu.is_active, TRUE) AS is_active,
    uu.auth_provider,
    COALESCE(up.plan, 'free')::text AS plan,
    COALESCE(uu.marketing_consent, FALSE) AS marketing_consent
  FROM auth.users au
  LEFT JOIN user_usage uu ON uu.user_id = au.id
  LEFT JOIN user_plans up ON up.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

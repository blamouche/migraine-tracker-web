-- ============================================================
-- ADMIN — fonction pour lister les utilisateurs avec métriques
-- ============================================================
-- SECURITY DEFINER permet d'accéder à auth.users sans exposer
-- la table côté client. La vérification du rôle admin est faite
-- dans la fonction elle-même.

CREATE OR REPLACE FUNCTION get_admin_user_list()
RETURNS TABLE (
  user_id          UUID,
  email_masked     TEXT,
  email_full       TEXT,
  created_at       TIMESTAMPTZ,
  last_active_at   TIMESTAMPTZ,
  session_count    INTEGER,
  profile_count    INTEGER,
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
  -- Vérification du rôle admin
  IF (auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  RETURN QUERY
  SELECT
    au.id AS user_id,
    -- Email masqué : premier caractère + *** + @domaine
    CONCAT(
      LEFT(au.email, 1),
      '***@',
      SPLIT_PART(au.email, '@', 2)
    ) AS email_masked,
    au.email AS email_full,
    au.created_at,
    uu.last_active_at,
    COALESCE(uu.session_count, 0) AS session_count,
    COALESCE(uu.profile_count, 0) AS profile_count,
    COALESCE(uu.is_active, TRUE) AS is_active,
    uu.auth_provider,
    COALESCE(
      (SELECT pp.plan FROM profile_plans pp WHERE pp.user_id = au.id LIMIT 1),
      'free'
    ) AS plan,
    COALESCE(uu.marketing_consent, FALSE) AS marketing_consent
  FROM auth.users au
  LEFT JOIN user_usage uu ON uu.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- ============================================================
-- ADMIN — fonction pour révéler l'email complet (journalisée)
-- ============================================================

CREATE OR REPLACE FUNCTION reveal_user_email(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_email TEXT;
BEGIN
  -- Vérification du rôle admin
  IF (auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  -- Récupérer l'email
  SELECT email INTO full_email FROM auth.users WHERE id = target_user_id;

  IF full_email IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Journaliser l'action
  INSERT INTO admin_log (admin_id, action, target_id, new_value)
  VALUES (auth.uid(), 'reveal_email', target_user_id, 'Email révélé');

  RETURN full_email;
END;
$$;

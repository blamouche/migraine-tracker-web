-- ============================================================
-- E31 / E32 / E33 — Fonctions admin avancées
-- Gestion utilisateurs, statistiques, exports
-- ============================================================

-- ============================================================
-- Tracking activité utilisateur (last_active_at + session_count)
-- ============================================================

CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_usage (user_id, last_active_at, session_count, is_active)
  VALUES (auth.uid(), NOW(), 1, TRUE)
  ON CONFLICT (user_id) DO UPDATE SET
    last_active_at = NOW(),
    session_count = user_usage.session_count + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION track_user_activity() TO authenticated;

-- ============================================================
-- E31 — Changer le plan d'un utilisateur
-- ============================================================

CREATE OR REPLACE FUNCTION change_user_plan(target_user_id UUID, new_plan TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_plan TEXT;
  admin_id UUID;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  admin_id := auth.uid();

  -- Récupérer l'ancien plan
  SELECT plan INTO old_plan FROM user_plans WHERE user_id = target_user_id;

  IF old_plan IS NULL THEN
    -- Aucune entrée : créer avec le nouveau plan
    INSERT INTO user_plans (user_id, plan, plan_activated_at)
    VALUES (target_user_id, new_plan, NOW());
    old_plan := 'free';
  ELSE
    UPDATE user_plans SET plan = new_plan, plan_activated_at = NOW()
    WHERE user_id = target_user_id;
  END IF;

  -- Journaliser
  INSERT INTO admin_log (admin_id, action, target_id, old_value, new_value)
  VALUES (admin_id, 'change_plan', target_user_id, old_plan, new_plan);
END;
$$;

GRANT EXECUTE ON FUNCTION change_user_plan(UUID, TEXT) TO authenticated;

-- ============================================================
-- E32 — Statistiques admin (KPIs)
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_30d', (SELECT COUNT(*) FROM user_usage WHERE last_active_at > NOW() - INTERVAL '30 days'),
    'new_this_month', (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', NOW())),
    'free_count', (SELECT COUNT(*) FROM auth.users au WHERE NOT EXISTS (SELECT 1 FROM user_plans up WHERE up.user_id = au.id AND up.plan != 'free')),
    'pro_count', (SELECT COUNT(*) FROM user_plans WHERE plan = 'pro')
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- ============================================================
-- E32 — Inscriptions par mois (ventilé par plan)
-- ============================================================

CREATE OR REPLACE FUNCTION get_signups_by_month()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      to_char(date_trunc('month', au.created_at), 'YYYY-MM') AS month,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE COALESCE(up.plan, 'free') = 'free') AS free_count,
      COUNT(*) FILTER (WHERE up.plan = 'pro') AS pro_count
    FROM auth.users au
    LEFT JOIN user_plans up ON up.user_id = au.id
    WHERE au.created_at >= NOW() - INTERVAL '12 months'
    GROUP BY date_trunc('month', au.created_at)
    ORDER BY date_trunc('month', au.created_at)
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_signups_by_month() TO authenticated;

-- ============================================================
-- E32 — Utilisateurs actifs par période (granularité variable)
-- ============================================================

CREATE OR REPLACE FUNCTION get_active_users_by_period(granularity TEXT DEFAULT 'month')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  date_interval INTERVAL;
  trunc_unit TEXT;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  IF granularity = 'day' THEN
    date_interval := INTERVAL '30 days';
    trunc_unit := 'day';
  ELSIF granularity = 'week' THEN
    date_interval := INTERVAL '12 weeks';
    trunc_unit := 'week';
  ELSE
    date_interval := INTERVAL '12 months';
    trunc_unit := 'month';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      to_char(date_trunc(trunc_unit, uu.last_active_at), 'YYYY-MM-DD') AS period,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE COALESCE(up.plan, 'free') = 'free') AS free_count,
      COUNT(*) FILTER (WHERE up.plan = 'pro') AS pro_count
    FROM user_usage uu
    LEFT JOIN user_plans up ON up.user_id = uu.user_id
    WHERE uu.last_active_at >= NOW() - date_interval
    GROUP BY date_trunc(trunc_unit, uu.last_active_at)
    ORDER BY date_trunc(trunc_unit, uu.last_active_at)
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_active_users_by_period(TEXT) TO authenticated;

-- ============================================================
-- E32 — Répartition des abonnements (pie chart)
-- ============================================================

CREATE OR REPLACE FUNCTION get_subscription_distribution()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  SELECT json_build_object(
    'distribution', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          COALESCE(up.plan, 'free') AS plan,
          COUNT(*) AS count
        FROM auth.users au
        LEFT JOIN user_plans up ON up.user_id = au.id
        GROUP BY COALESCE(up.plan, 'free')
        ORDER BY count DESC
      ) t
    ),
    'conversion_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE up.plan = 'pro')::numeric /
         NULLIF(COUNT(*)::numeric, 0)) * 100, 1
      )
      FROM auth.users au
      LEFT JOIN user_plans up ON up.user_id = au.id
    ),
    'pro_change_30d', (
      SELECT COUNT(*)
      FROM admin_log
      WHERE action = 'change_plan'
        AND new_value = 'pro'
        AND created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_subscription_distribution() TO authenticated;

-- ============================================================
-- E33 — Export emails filtrés (plan + activité)
-- ============================================================

CREATE OR REPLACE FUNCTION export_admin_emails(
  plan_filter TEXT DEFAULT NULL,
  activity_filter TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  admin_id UUID;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : rôle admin requis';
  END IF;

  admin_id := auth.uid();

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      au.email::text AS email,
      COALESCE(up.plan, 'free')::text AS plan,
      au.created_at,
      uu.last_active_at
    FROM auth.users au
    LEFT JOIN user_plans up ON up.user_id = au.id
    LEFT JOIN user_usage uu ON uu.user_id = au.id
    WHERE
      (plan_filter IS NULL OR COALESCE(up.plan, 'free') = plan_filter)
      AND (
        activity_filter IS NULL
        OR (activity_filter = 'active' AND uu.last_active_at > NOW() - INTERVAL '30 days')
        OR (activity_filter = 'inactive' AND uu.last_active_at BETWEEN NOW() - INTERVAL '90 days' AND NOW() - INTERVAL '30 days')
        OR (activity_filter = 'dormant' AND uu.last_active_at < NOW() - INTERVAL '90 days')
        OR (activity_filter = 'never' AND uu.last_active_at IS NULL)
      )
    ORDER BY au.created_at DESC
  ) t;

  -- Journaliser l'export groupé
  INSERT INTO admin_log (admin_id, action, target_id, old_value, new_value)
  VALUES (
    admin_id,
    'export_emails',
    NULL,
    COALESCE(plan_filter, 'all') || '+' || COALESCE(activity_filter, 'all'),
    (SELECT COUNT(*)::text FROM json_array_elements(COALESCE(result, '[]'::json))) || ' emails exportés'
  );

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION export_admin_emails(TEXT, TEXT) TO authenticated;

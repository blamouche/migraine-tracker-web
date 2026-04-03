-- ============================================================
-- E20 — Add device_id to mobile_transit & enable pg_cron purge
-- ============================================================

-- Add device_id column for per-device tracking
ALTER TABLE mobile_transit
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Index for faster sync queries (unsynced entries per user)
CREATE INDEX IF NOT EXISTS idx_mobile_transit_pending
  ON mobile_transit (user_id, created_at)
  WHERE synced_at IS NULL AND deleted_at IS NULL;

-- ============================================================
-- CRON — purge mobile_transit > 90 jours non synchronisé
-- Requires pg_cron extension enabled in Database > Extensions
-- ============================================================

-- pg_cron : only runs if the extension is active (safe to skip locally)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'purge-mobile-transit',
      '0 3 * * *',
      'DELETE FROM mobile_transit WHERE synced_at IS NULL AND created_at < NOW() - INTERVAL ''90 days'''
    );
  ELSE
    RAISE NOTICE 'pg_cron not enabled — skipping cron schedule (enable it in production)';
  END IF;
END $$;

-- ============================================================
-- FUNCTION — notify_stale_mobile_entries
-- Returns users with unsynced entries older than 80 days
-- Called by the notification system or cron
-- ============================================================

CREATE OR REPLACE FUNCTION notify_stale_mobile_entries()
RETURNS TABLE(user_id UUID, entry_count BIGINT, oldest_entry TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
    SELECT mt.user_id, COUNT(*) AS entry_count, MIN(mt.created_at) AS oldest_entry
    FROM mobile_transit mt
    WHERE mt.synced_at IS NULL
      AND mt.deleted_at IS NULL
      AND mt.created_at < NOW() - INTERVAL '80 days'
    GROUP BY mt.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

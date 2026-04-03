-- ============================================================
-- E20 fix — Change BYTEA to TEXT + allow anonymous mobile inserts
-- ============================================================

-- The mobile app sends base64 strings, not raw bytes
ALTER TABLE mobile_transit
  ALTER COLUMN encrypted_payload TYPE TEXT USING encode(encrypted_payload, 'base64'),
  ALTER COLUMN iv TYPE TEXT USING encode(iv, 'base64');

-- Mobile devices are not authenticated (no Supabase session).
-- They use the anon key from the QR payload to insert encrypted blobs.
-- Allow anonymous INSERT — the data is AES-256-GCM encrypted and meaningless
-- without the key held only by the desktop app.
CREATE POLICY "anon can insert mobile entries"
  ON mobile_transit
  FOR INSERT
  WITH CHECK (true);

-- Keep existing SELECT/UPDATE/DELETE restricted to authenticated owner
-- (already covered by "own data only" policy)

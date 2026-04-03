-- E38 & E39: Add columns for fast reconnection and vault settings
-- cgu_consent_at: timestamp of CGU acceptance (E39)
-- onboarding_profile_done: flag for medical profile completion/skip (E39)
-- vault_folder_name: display name of the vault folder (E38)

ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS cgu_consent_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_profile_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vault_folder_name      TEXT;

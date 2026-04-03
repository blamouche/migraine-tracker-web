import { useEffect, useState } from 'react'

const MIGRATION_KEY = 'migraine-ai-profiles-migrated'

/**
 * One-time migration: clean up legacy multi-profile localStorage data.
 * Returns true if the user had multiple profiles (informational message needed).
 */
export function useProfileMigration() {
  const [hadMultipleProfiles, setHadMultipleProfiles] = useState(false)
  const [showMigrationNotice, setShowMigrationNotice] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(MIGRATION_KEY)) return

    try {
      const raw = localStorage.getItem('migraine-ai-profiles')
      if (raw) {
        const data = JSON.parse(raw)
        const profiles = data?.state?.profiles
        if (Array.isArray(profiles) && profiles.length > 1) {
          setHadMultipleProfiles(true)
          setShowMigrationNotice(true)
        }
        // Clean up legacy storage
        localStorage.removeItem('migraine-ai-profiles')
      }
    } catch {
      // Ignore parse errors
    }

    localStorage.setItem(MIGRATION_KEY, 'true')
  }, [])

  const dismissNotice = () => setShowMigrationNotice(false)

  return { hadMultipleProfiles, showMigrationNotice, dismissNotice }
}

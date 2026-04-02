/**
 * E29 — Module preferences store
 * Controls which tracking modules are visible in the app.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ModuleConfig, ModuleId } from '@/types/modules'
import { DEFAULT_MODULE_CONFIG, MODULE_ROUTE_MAP, CORE_ROUTES } from '@/types/modules'
import { readModuleConfig, writeModuleConfig } from '@/lib/vault/modules'

interface ModuleState {
  config: ModuleConfig
  loaded: boolean

  /** Load config from vault (falls back to defaults) */
  loadConfig: () => Promise<void>

  /** Toggle a single module on/off and persist to vault */
  setModuleEnabled: (moduleId: ModuleId, enabled: boolean) => Promise<void>

  /** Check if a module is enabled */
  isModuleEnabled: (moduleId: ModuleId) => boolean

  /** Check if a route path is accessible (module enabled or core route) */
  isRouteEnabled: (path: string) => boolean
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_MODULE_CONFIG },
      loaded: false,

      loadConfig: async () => {
        const vaultConfig = await readModuleConfig()
        if (vaultConfig) {
          set({ config: vaultConfig, loaded: true })
        } else {
          set({ loaded: true })
        }
      },

      setModuleEnabled: async (moduleId, enabled) => {
        const newConfig = { ...get().config, [moduleId]: enabled }
        set({ config: newConfig })
        await writeModuleConfig(newConfig)
      },

      isModuleEnabled: (moduleId) => {
        return get().config[moduleId]
      },

      isRouteEnabled: (path) => {
        // Core routes are always accessible
        if (CORE_ROUTES.some((r) => path === r || path.startsWith(r + '/'))) {
          return true
        }

        // Check if the route belongs to a disabled module
        const config = get().config
        for (const [moduleId, prefixes] of Object.entries(MODULE_ROUTE_MAP)) {
          for (const prefix of prefixes) {
            if (path === prefix || path.startsWith(prefix + '/')) {
              return config[moduleId as ModuleId]
            }
          }
        }

        // Unknown routes are allowed
        return true
      },
    }),
    {
      name: 'migraine-ai-modules',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
      }),
    },
  ),
)

/**
 * E22 — Session lock via BroadcastChannel
 * Prevents concurrent writes when multiple tabs access the same vault.
 */

const CHANNEL_NAME = 'migraine-ai-session-lock'

export type SessionRole = 'primary' | 'readonly'

let channel: BroadcastChannel | null = null
let currentRole: SessionRole = 'primary'
let roleChangeCallback: ((role: SessionRole) => void) | null = null

export function initSessionLock(onRoleChange: (role: SessionRole) => void): SessionRole {
  roleChangeCallback = onRoleChange

  if (typeof BroadcastChannel === 'undefined') {
    return 'primary'
  }

  channel = new BroadcastChannel(CHANNEL_NAME)

  // Announce presence
  channel.postMessage({ type: 'ping', tabId: getTabId() })

  channel.onmessage = (event) => {
    const { type, tabId } = event.data

    if (type === 'ping' && tabId !== getTabId()) {
      // Another tab is present — we're the second tab
      currentRole = 'readonly'
      roleChangeCallback?.('readonly')
      channel?.postMessage({ type: 'ack-readonly', tabId: getTabId() })
    }

    if (type === 'take-control' && tabId !== getTabId()) {
      // Another tab wants to take control
      currentRole = 'readonly'
      roleChangeCallback?.('readonly')
    }

    if (type === 'release') {
      // Primary tab released control
      currentRole = 'primary'
      roleChangeCallback?.('primary')
    }
  }

  return 'primary'
}

export function takeControl(): void {
  currentRole = 'primary'
  channel?.postMessage({ type: 'take-control', tabId: getTabId() })
  roleChangeCallback?.('primary')
}

export function releaseControl(): void {
  currentRole = 'readonly'
  channel?.postMessage({ type: 'release', tabId: getTabId() })
  roleChangeCallback?.('readonly')
}

export function getSessionRole(): SessionRole {
  return currentRole
}

export function destroySessionLock(): void {
  channel?.postMessage({ type: 'release', tabId: getTabId() })
  channel?.close()
  channel = null
}

let tabId: string | null = null
function getTabId(): string {
  if (!tabId) {
    tabId = crypto.randomUUID()
  }
  return tabId
}

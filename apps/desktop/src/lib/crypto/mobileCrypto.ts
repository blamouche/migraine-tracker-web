/**
 * AES-256-GCM encryption/decryption for mobile sync
 * All crypto operations happen client-side using Web Crypto API
 */

export async function generateSyncKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  const raw = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(raw)))
}

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(data: string, base64Key: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await importKey(base64Key)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(data)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  )
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

export async function decrypt(ciphertext: string, iv: string, base64Key: string): Promise<string> {
  const key = await importKey(base64Key)
  const encryptedData = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    key,
    encryptedData,
  )
  return new TextDecoder().decode(decrypted)
}

export function generateQRPayload(secretKey: string, userId: string): string {
  return JSON.stringify({
    version: 1,
    key: secretKey,
    userId,
    endpoint: 'https://your-supabase-url.supabase.co',
  })
}

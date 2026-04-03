/**
 * AES-256-GCM encryption for mobile entries
 * Mirrors desktop mobileCrypto.ts — encrypt-only (mobile never decrypts)
 */

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
}

export async function encrypt(
  data: string,
  base64Key: string,
): Promise<{ ciphertext: string; iv: string }> {
  const key = await importKey(base64Key)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(data)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

import { idbGet, idbSet, idbDelete } from './idb'

const ANON_ID_KEY = 'anonymous-id'

export async function getOrCreateAnonymousId(): Promise<string> {
  const existing = await idbGet<string>(ANON_ID_KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  await idbSet(ANON_ID_KEY, id)
  return id
}

export async function getAnonymousId(): Promise<string | undefined> {
  return idbGet<string>(ANON_ID_KEY)
}

export async function removeAnonymousId(): Promise<void> {
  return idbDelete(ANON_ID_KEY)
}

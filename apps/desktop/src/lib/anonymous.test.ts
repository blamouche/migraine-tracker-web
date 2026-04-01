import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockIdbStore: Record<string, unknown> = {}

vi.mock('@/lib/idb', () => ({
  idbGet: vi.fn((key: string) => Promise.resolve(mockIdbStore[key])),
  idbSet: vi.fn((key: string, value: unknown) => {
    mockIdbStore[key] = value
    return Promise.resolve()
  }),
  idbDelete: vi.fn((key: string) => {
    delete mockIdbStore[key]
    return Promise.resolve()
  }),
}))

import { getOrCreateAnonymousId, getAnonymousId, removeAnonymousId } from './anonymous'

describe('anonymous', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockIdbStore)) {
      delete mockIdbStore[key]
    }
  })

  it('creates a new anonymous ID when none exists', async () => {
    const id = await getOrCreateAnonymousId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  it('returns the same ID on subsequent calls', async () => {
    const id1 = await getOrCreateAnonymousId()
    const id2 = await getOrCreateAnonymousId()
    expect(id1).toBe(id2)
  })

  it('getAnonymousId returns undefined when no ID exists', async () => {
    const id = await getAnonymousId()
    expect(id).toBeUndefined()
  })

  it('getAnonymousId returns the ID after creation', async () => {
    await getOrCreateAnonymousId()
    const id = await getAnonymousId()
    expect(id).toBeTruthy()
  })

  it('removeAnonymousId removes the stored ID', async () => {
    await getOrCreateAnonymousId()
    await removeAnonymousId()
    const id = await getAnonymousId()
    expect(id).toBeUndefined()
  })
})

import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('@/lib/anonymous', () => ({
  getOrCreateAnonymousId: vi.fn().mockResolvedValue('test-anon-id'),
}))

describe('App', () => {
  it('renders ThemeProvider without crashing', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <div>Test</div>
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
  })
})

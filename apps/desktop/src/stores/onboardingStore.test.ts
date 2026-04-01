import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from './onboardingStore'

describe('onboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset()
  })

  it('starts at login step', () => {
    const state = useOnboardingStore.getState()
    expect(state.step).toBe('login')
    expect(state.consentCGU).toBe(false)
    expect(state.consentMarketing).toBe(false)
    expect(state.vaultReady).toBe(false)
    expect(state.medicalProfileDone).toBe(false)
  })

  it('accepts consent and advances to vault-selection', () => {
    useOnboardingStore.getState().acceptConsent(true, false)
    const state = useOnboardingStore.getState()
    expect(state.consentCGU).toBe(true)
    expect(state.consentMarketing).toBe(false)
    expect(state.consentMarketingAt).toBeNull()
    expect(state.step).toBe('vault-selection')
  })

  it('records marketing consent timestamp when accepted', () => {
    useOnboardingStore.getState().acceptConsent(true, true)
    const state = useOnboardingStore.getState()
    expect(state.consentMarketing).toBe(true)
    expect(state.consentMarketingAt).toBeTruthy()
  })

  it('marks vault ready and advances to medical-profile', () => {
    useOnboardingStore.getState().markVaultReady()
    const state = useOnboardingStore.getState()
    expect(state.vaultReady).toBe(true)
    expect(state.step).toBe('medical-profile')
  })

  it('marks medical profile done and advances to complete', () => {
    useOnboardingStore.getState().markMedicalProfileDone()
    const state = useOnboardingStore.getState()
    expect(state.medicalProfileDone).toBe(true)
    expect(state.step).toBe('complete')
  })

  it('completeOnboarding sets step to complete', () => {
    useOnboardingStore.getState().completeOnboarding()
    expect(useOnboardingStore.getState().step).toBe('complete')
  })

  it('resets all state', () => {
    useOnboardingStore.getState().acceptConsent(true, true)
    useOnboardingStore.getState().markVaultReady()
    useOnboardingStore.getState().markMedicalProfileDone()
    useOnboardingStore.getState().reset()

    const state = useOnboardingStore.getState()
    expect(state.step).toBe('login')
    expect(state.consentCGU).toBe(false)
    expect(state.vaultReady).toBe(false)
    expect(state.medicalProfileDone).toBe(false)
  })
})

export type AlertType =
  | 'high-frequency'
  | 'triptan-overuse'
  | 'food-trigger'
  | 'consultation-reminder'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  severity: 'info' | 'warning' | 'danger'
  dismissedAt: string | null
  createdAt: string
}

export interface AlertPreferences {
  frequencyThreshold: number // crises/month to trigger alert (default: 4)
  triptanThreshold: number // triptans/month (default: 10)
  consultationReminderMonths: number // months since last consultation (default: 6)
  foodCorrelationThreshold: number // percentage (default: 70)
  enableFrequencyAlert: boolean
  enableTriptanAlert: boolean
  enableConsultationReminder: boolean
  enableFoodTriggerAlert: boolean
}

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  frequencyThreshold: 4,
  triptanThreshold: 10,
  consultationReminderMonths: 6,
  foodCorrelationThreshold: 70,
  enableFrequencyAlert: true,
  enableTriptanAlert: true,
  enableConsultationReminder: true,
  enableFoodTriggerAlert: true,
}

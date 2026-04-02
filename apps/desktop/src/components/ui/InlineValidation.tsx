import type { FieldError } from 'react-hook-form'

interface InlineValidationProps {
  error: FieldError | undefined
  touched: boolean | undefined
  id: string
}

export function InlineValidation({ error, touched, id }: InlineValidationProps) {
  if (error && touched) {
    return (
      <p id={`${id}-error`} className="mt-1 flex items-center gap-1 text-xs text-(--color-danger)" role="alert">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
        {error.message}
      </p>
    )
  }

  return null
}

interface ValidatedFieldProps {
  label: string
  id: string
  error: FieldError | undefined
  touched: boolean | undefined
  valid?: boolean
  required?: boolean
  children: React.ReactNode
}

export function ValidatedField({ label, id, error, touched, valid, required, children }: ValidatedFieldProps) {
  const hasError = Boolean(error && touched)

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${hasError ? 'text-(--color-danger)' : 'text-(--color-text-primary)'}`}
      >
        {label}
        {required && <span className="text-(--color-danger)"> *</span>}
      </label>
      <div className="relative">
        {children}
        {valid && touched && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-success)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>
      <InlineValidation error={error} touched={touched} id={id} />
    </div>
  )
}

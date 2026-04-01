function getCSSVar(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function getNivoTheme() {
  return {
    background: getCSSVar('--color-bg-elevated'),
    text: {
      fill: getCSSVar('--color-text-primary'),
      fontSize: 12,
    },
    axis: {
      domain: {
        line: {
          stroke: getCSSVar('--color-border'),
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: getCSSVar('--color-border'),
          strokeWidth: 1,
        },
        text: {
          fill: getCSSVar('--color-text-secondary'),
          fontSize: 11,
        },
      },
      legend: {
        text: {
          fill: getCSSVar('--color-text-primary'),
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    grid: {
      line: {
        stroke: getCSSVar('--color-border'),
        strokeWidth: 1,
      },
    },
    tooltip: {
      container: {
        background: getCSSVar('--color-bg-elevated'),
        color: getCSSVar('--color-text-primary'),
        fontSize: 13,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
    crosshair: {
      line: {
        stroke: getCSSVar('--color-brand'),
        strokeWidth: 1,
        strokeOpacity: 0.5,
      },
    },
  }
}

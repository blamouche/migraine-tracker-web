export const nivoTheme = {
  background: 'transparent',
  text: {
    fill: 'var(--color-text-secondary)',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  axis: {
    domain: { line: { stroke: 'var(--color-border)', strokeWidth: 1 } },
    ticks: {
      line: { stroke: 'var(--color-border)', strokeWidth: 1 },
      text: { fill: 'var(--color-text-muted)', fontSize: 11 },
    },
    legend: { text: { fill: 'var(--color-text-secondary)', fontSize: 12 } },
  },
  grid: {
    line: { stroke: 'var(--color-border)', strokeDasharray: '4 4' },
  },
  tooltip: {
    container: {
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      color: 'var(--color-text-primary)',
      fontSize: 13,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  legends: {
    text: { fill: 'var(--color-text-secondary)', fontSize: 12 },
  },
}

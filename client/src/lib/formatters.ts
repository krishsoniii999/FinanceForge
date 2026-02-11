import numeral from 'numeral'

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e12) return numeral(value).format('$0.00a').toUpperCase()
  if (Math.abs(value) >= 1e9) return numeral(value).format('$0.00a').toUpperCase()
  if (Math.abs(value) >= 1e6) return numeral(value).format('$0.00a').toUpperCase()
  return numeral(value).format('$0,0.00')
}

export function formatPrice(value: number): string {
  return numeral(value).format('$0,0.00')
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return numeral(value).format('0.00a').toUpperCase()
  if (Math.abs(value) >= 1e9) return numeral(value).format('0.00a').toUpperCase()
  if (Math.abs(value) >= 1e6) return numeral(value).format('0.00a').toUpperCase()
  return numeral(value).format('0,0')
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${numeral(value).format('0.00')}%`
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${numeral(value).format('0.00')}`
}

export function formatVolume(value: number): string {
  return numeral(value).format('0.00a').toUpperCase()
}

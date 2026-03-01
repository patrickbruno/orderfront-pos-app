/**
 * Format cents as Euro string with German locale.
 * e.g. 1250 → "12,50 €"
 */
export function centsToEuros(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })
}

/** Sum multiple cent values, returning an integer. */
export function sumCents(...values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

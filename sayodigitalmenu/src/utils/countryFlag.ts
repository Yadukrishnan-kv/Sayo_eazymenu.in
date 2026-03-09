/**
 * Returns a flag emoji for an ISO 3166-1 alpha-2 country code (e.g. JP, TH).
 * Uses Unicode regional indicator symbols.
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const upper = countryCode.toUpperCase()
  const codePoints = [...upper].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65))
  return String.fromCodePoint(...codePoints)
}

export const COUNTRY_NAMES: Record<string, string> = {
  JP: 'Japan',
  CN: 'China',
  TH: 'Thailand',
  IN: 'India',
  US: 'United States',
  FR: 'France',
  KR: 'South Korea',
  VN: 'Vietnam',
  CY: 'Cyprus',
}

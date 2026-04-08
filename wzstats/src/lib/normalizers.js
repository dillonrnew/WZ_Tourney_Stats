// Shared text and number normalization utilities used across the app

export const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

export const normalizeRosterKey = (value) =>
  String(value || '')
    .split('|')
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join('|')

// Returns 0 for non-finite values
export const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Returns null for non-finite values
export const toNumberOrNull = (value) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

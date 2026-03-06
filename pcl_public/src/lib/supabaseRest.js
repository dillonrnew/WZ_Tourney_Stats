const FALLBACK_SUPABASE_URL = 'https://mswibjiemxfddkymdpta.supabase.co'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
let supabaseRequestCount = 0

export const getSupabaseRequestCount = () => supabaseRequestCount

const buildHeaders = () => {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable.')
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
}

const buildUrl = (tableName, queryString) =>
  `${SUPABASE_URL}/rest/v1/${encodeURIComponent(tableName)}?${queryString}`

const escapeInValue = (value) => {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

const buildQueryParams = ({ filters = {}, order = null, limit = null, offset = null } = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([column, value]) => {
    if (Array.isArray(value)) {
      const valid = value.filter((item) => item !== undefined && item !== null && item !== '')
      if (valid.length > 0) {
        params.set(column, `in.(${valid.map(escapeInValue).join(',')})`)
      }
      return
    }

    if (value !== undefined && value !== null && value !== '') {
      params.set(column, `eq.${value}`)
    }
  })

  if (order?.column) {
    params.set('order', `${order.column}.${order.ascending ? 'asc' : 'desc'}`)
  }

  if (Number.isFinite(limit) && Number(limit) > 0) {
    params.set('limit', String(Number(limit)))
  }

  if (Number.isFinite(offset) && Number(offset) >= 0) {
    params.set('offset', String(Number(offset)))
  }

  return params
}

export async function fetchRows(
  tableName,
  { select = '*', filters = {}, order = null, limit = null, offset = null, signal } = {},
) {
  supabaseRequestCount += 1
  const params = buildQueryParams({ filters, order, limit, offset })
  params.set('select', select)

  const response = await fetch(buildUrl(tableName, params.toString()), {
    method: 'GET',
    headers: buildHeaders(),
    signal,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase query failed (${response.status}): ${message}`)
  }

  return response.json()
}

export async function insertRow(tableName, row, { signal } = {}) {
  supabaseRequestCount += 1
  const response = await fetch(buildUrl(tableName, ''), {
    method: 'POST',
    headers: {
      ...buildHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
    signal,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase insert failed (${response.status}): ${message}`)
  }

  return response.json()
}

export async function updateRows(
  tableName,
  row,
  { filters = {}, signal } = {},
) {
  supabaseRequestCount += 1
  const params = buildQueryParams({ filters })
  params.set('select', '*')

  const response = await fetch(buildUrl(tableName, params.toString()), {
    method: 'PATCH',
    headers: {
      ...buildHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
    signal,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase update failed (${response.status}): ${message}`)
  }

  return response.json()
}

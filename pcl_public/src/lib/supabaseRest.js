const FALLBACK_SUPABASE_URL = 'https://cszyqguhwvxnkozuyldj.supabase.co'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

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

export async function fetchRows(
  tableName,
  { select = '*', filters = {}, order = null, signal } = {},
) {
  const params = new URLSearchParams()
  params.set('select', select)

  Object.entries(filters).forEach(([column, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(column, `eq.${value}`)
    }
  })

  if (order?.column) {
    params.set('order', `${order.column}.${order.ascending ? 'asc' : 'desc'}`)
  }

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

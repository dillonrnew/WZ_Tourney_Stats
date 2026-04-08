import { useEffect, useState } from 'react'

/**
 * Runs an async function and tracks its loading/error/data state.
 * Automatically cancels the previous call when deps change or the
 * component unmounts, preventing stale state updates.
 *
 * @param {() => Promise<T>} asyncFn  - async function that returns the data
 * @param {any[]} deps                - same as useEffect deps
 * @returns {{ data: T|null, loading: boolean, error: string|null }}
 */
export function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))

    asyncFn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: err?.message || 'An error occurred.',
          }))
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

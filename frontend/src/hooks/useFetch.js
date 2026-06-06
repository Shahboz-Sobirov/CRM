import { useCallback, useEffect, useState } from 'react'

/**
 * Generic data fetching hook.
 * @param {Function} fetcher - async function returning an axios response
 * @param {Array} deps - dependency array to re-run the fetch
 */
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      setData(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refetch: run, setData }
}

// Helper to normalize DRF paginated or plain list responses
export function asList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

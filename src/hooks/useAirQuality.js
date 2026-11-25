import { useCallback, useEffect, useState } from 'react'
import { fetchAirQuality } from '../services/weatherApi'

export function useAirQuality(location) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })
  const [refreshToken, setRefreshToken] = useState(0)
  const locationKey = location ? `${location.latitude},${location.longitude}` : ''

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), [])

  useEffect(() => {
    if (!location) {
      setState({ status: 'idle', data: null, error: null })
      return undefined
    }

    const controller = new AbortController()
    setState((previous) => ({ ...previous, status: previous.data ? 'success' : 'loading', error: null }))

    fetchAirQuality(location, controller.signal, { bypassCache: refreshToken > 0 })
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setState({
          status: 'error',
          data: null,
          error: error?.message ?? 'Air quality data is unavailable.',
        })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, refreshToken])

  return { ...state, refresh }
}

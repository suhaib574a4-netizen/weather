import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchForecast } from '../services/weatherApi'

const initialState = {
  status: 'idle',
  data: null,
  error: null,
  refreshError: null,
  lastUpdated: null,
}

export function useWeather(location, refreshMinutes = 0) {
  const [state, setState] = useState(() => ({
    ...initialState,
    status: location ? 'loading' : 'idle',
  }))
  const [refreshToken, setRefreshToken] = useState(0)
  const locationKey = location ? `${location.latitude},${location.longitude}` : ''
  const lastUpdatedRef = useRef(null)

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), [])

  useEffect(() => {
    if (!location) {
      setState({ ...initialState })
      return undefined
    }

    const controller = new AbortController()
    setState((previous) => ({
      ...previous,
      status: previous.data ? 'success' : 'loading',
      error: null,
      refreshError: null,
    }))

    fetchForecast(location, controller.signal, { bypassCache: refreshToken > 0 })
      .then((data) => {
        lastUpdatedRef.current = Date.now()
        setState({
          status: 'success',
          data,
          error: null,
          refreshError: null,
          lastUpdated: lastUpdatedRef.current,
        })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        const message = error?.message ?? 'Something went wrong. Please try again.'
        setState((previous) =>
          previous.data
            ? { ...previous, refreshError: message }
            : { ...initialState, status: 'error', error: message },
        )
      })

    return () => controller.abort()
    // locationKey identifies the coordinates; the object identity may change on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, refreshToken])

  useEffect(() => {
    if (!location || !refreshMinutes) return undefined

    const interval = setInterval(refresh, refreshMinutes * 60 * 1000)
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const elapsed = Date.now() - (lastUpdatedRef.current ?? 0)
      if (elapsed >= refreshMinutes * 60 * 1000) refresh()
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [location, refreshMinutes, refresh])

  return { ...state, refresh, isRefreshing: state.status === 'loading' && Boolean(state.data) }
}

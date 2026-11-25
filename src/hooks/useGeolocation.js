import { useCallback, useState } from 'react'
import { reverseGeocode } from '../services/weatherApi'

const MESSAGES = {
  denied: 'Location permission was denied. Search for a city manually instead.',
  unavailable: 'Your location is unavailable. Search for a city manually instead.',
  timeout: 'Locating you took too long. Please try again or search manually.',
}

export function useGeolocation() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const locate = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError(MESSAGES.unavailable)
      return null
    }

    setStatus('loading')
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const latitude = Number(coords.latitude.toFixed(4))
          const longitude = Number(coords.longitude.toFixed(4))
          const located = await reverseGeocode(latitude, longitude)
          const fallback = {
            id: `geo-${latitude}-${longitude}`,
            name: 'My location',
            admin1: '',
            country: '',
            countryCode: '',
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            population: null,
          }
          setStatus('success')
          resolve(located ?? fallback)
        },
        (positionError) => {
          const message =
            positionError.code === positionError.PERMISSION_DENIED
              ? MESSAGES.denied
              : positionError.code === positionError.TIMEOUT
                ? MESSAGES.timeout
                : MESSAGES.unavailable
          setStatus('error')
          setError(message)
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      )
    })
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return { status, error, locate, reset }
}

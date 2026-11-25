import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useAirQuality } from '../hooks/useAirQuality'
import { useGeolocation } from '../hooks/useGeolocation'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWeather } from '../hooks/useWeather'

const STORAGE = {
  settings: 'skycastpro:settings:v1',
  favorites: 'skycastpro:favorites:v1',
  recent: 'skycastpro:recent:v1',
  location: 'skycastpro:location:v1',
}

export const DEFAULT_SETTINGS = {
  tempUnit: 'C',
  windUnit: 'kmh',
  theme: 'dark',
  clock: '24',
  refreshMinutes: 15,
}

const DEFAULT_LOCATION = {
  id: 2643743,
  name: 'London',
  admin1: 'England',
  country: 'United Kingdom',
  countryCode: 'GB',
  latitude: 51.5085,
  longitude: -0.1257,
  timezone: 'Europe/London',
  population: 8961989,
}

function locationKey(location) {
  if (!location) return ''
  return `${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(STORAGE.settings, DEFAULT_SETTINGS)
  const [favorites, setFavorites] = useLocalStorage(STORAGE.favorites, [])
  const [recent, setRecent] = useLocalStorage(STORAGE.recent, [])
  const [location, setLocation] = useLocalStorage(STORAGE.location, DEFAULT_LOCATION)

  const geo = useGeolocation()
  const weather = useWeather(location, settings.refreshMinutes)
  const air = useAirQuality(location)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme === 'light' ? 'light' : 'dark'
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      settings.theme === 'light' ? '#edf3fb' : '#06101f',
    )
  }, [settings.theme])

  const selectLocation = useCallback(
    (nextLocation) => {
      if (!nextLocation) return
      setLocation(nextLocation)
      const key = locationKey(nextLocation)
      setRecent((previous) => [
        nextLocation,
        ...previous.filter((item) => locationKey(item) !== key),
      ].slice(0, 8))
    },
    [setLocation, setRecent],
  )

  const toggleFavorite = useCallback(
    (target) => {
      const key = locationKey(target)
      setFavorites((previous) =>
        previous.some((item) => locationKey(item) === key)
          ? previous.filter((item) => locationKey(item) !== key)
          : [target, ...previous],
      )
    },
    [setFavorites],
  )

  const isFavorite = useCallback(
    (target) => favorites.some((item) => locationKey(item) === locationKey(target)),
    [favorites],
  )

  const removeFavorite = useCallback(
    (target) => setFavorites((previous) => previous.filter((item) => locationKey(item) !== locationKey(target))),
    [setFavorites],
  )

  const updateSettings = useCallback(
    (patch) => setSettings((previous) => ({ ...previous, ...patch })),
    [setSettings],
  )

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings])

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      location,
      selectLocation,
      favorites,
      toggleFavorite,
      removeFavorite,
      isFavorite,
      recent,
      clearRecent: () => setRecent([]),
      weather,
      air,
      geo,
    }),
    [
      settings,
      updateSettings,
      resetSettings,
      location,
      selectLocation,
      favorites,
      toggleFavorite,
      removeFavorite,
      isFavorite,
      recent,
      setRecent,
      weather,
      air,
      geo,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}

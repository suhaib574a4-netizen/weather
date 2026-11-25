/**
 * Open-Meteo API layer.
 * No API keys are used or stored. All requests are public and read-only.
 */

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

const CACHE = {
  geocode: 1000 * 60 * 60 * 24,
  forecast: 1000 * 60 * 10,
  air: 1000 * 60 * 10,
  reverse: 1000 * 60 * 60 * 24,
}

const REQUEST_TIMEOUT = 12000
const responseCache = new Map()

function cacheKey(url) {
  return url
}

function readCache(url) {
  const entry = responseCache.get(cacheKey(url))
  if (!entry) return null
  if (entry.expires < Date.now()) {
    responseCache.delete(cacheKey(url))
    return null
  }
  return entry.value
}

function writeCache(url, value, ttl) {
  if (!ttl) return
  if (responseCache.size > 120) responseCache.clear()
  responseCache.set(cacheKey(url), { value, expires: Date.now() + ttl })
}

export function clearWeatherCache() {
  responseCache.clear()
}

function combineSignals(signal, timeoutSignal) {
  if (!signal) return timeoutSignal
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([signal, timeoutSignal])
  const controller = new AbortController()
  const onAbort = () => controller.abort(signal.reason)
  if (signal.aborted) onAbort()
  else signal.addEventListener('abort', onAbort, { once: true })
  timeoutSignal.addEventListener('abort', () => controller.abort(), { once: true })
  return controller.signal
}

async function requestJson(url, signal, ttl, bypassCache = false) {
  if (!bypassCache) {
    const cached = readCache(url)
    if (cached) return cached
  }

  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT)
  const requestSignal = combineSignals(signal, timeout.signal)

  let response
  try {
    response = await fetch(url, { signal: requestSignal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (signal?.aborted || error?.name === 'AbortError') {
      const abortError = new Error('Request cancelled')
      abortError.name = 'AbortError'
      throw abortError
    }
    if (timeout.signal.aborted) {
      throw new Error('The weather service took too long to respond. Please try again.')
    }
    throw new Error('Unable to reach the weather service. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`The weather service returned an error (${response.status}). Please try again.`)
  }

  try {
    const data = await response.json()
    writeCache(url, data, ttl)
    return data
  } catch {
    throw new Error('The weather service returned an unexpected response. Please try again.')
  }
}

function buildUrl(base, params) {
  return `${base}?${new URLSearchParams(params)}`
}

function normalizeLocation(item) {
  return {
    id: item.id,
    name: item.name,
    admin1: item.admin1 ?? '',
    country: item.country ?? '',
    countryCode: item.country_code ?? '',
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone ?? 'UTC',
    population: item.population ?? null,
  }
}

export async function searchLocations(query, signal) {
  const url = buildUrl(GEOCODING_URL, {
    name: query.trim(),
    count: '8',
    language: 'en',
    format: 'json',
  })
  const data = await requestJson(url, signal, CACHE.geocode)
  return (data.results ?? []).map(normalizeLocation)
}

export async function reverseGeocode(latitude, longitude, signal) {
  const url = buildUrl(REVERSE_URL, {
    format: 'jsonv2',
    lat: latitude.toFixed(4),
    lon: longitude.toFixed(4),
    zoom: '10',
    'accept-language': 'en',
  })

  try {
    const data = await requestJson(url, signal, CACHE.reverse)
    const address = data.address ?? {}
    const name = address.city ?? address.town ?? address.village ?? address.county ?? data.name
    if (!name) return null

    return {
      id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
      name,
      admin1: address.state ?? address.region ?? '',
      country: address.country ?? '',
      countryCode: (address.country_code ?? '').toUpperCase(),
      latitude,
      longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      population: null,
    }
  } catch {
    return null
  }
}

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'weather_code',
  'cloud_cover',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
  'pressure_msl',
  'visibility',
  'uv_index',
].join(',')

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'is_day',
  'weather_code',
  'precipitation_probability',
  'relative_humidity_2m',
  'wind_speed_10m',
  'uv_index',
].join(',')

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
  'uv_index_max',
].join(',')

function forecastParams(location, { currentOnly = false } = {}) {
  return {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: CURRENT_FIELDS,
    ...(currentOnly ? {} : { hourly: HOURLY_FIELDS, daily: DAILY_FIELDS }),
    timezone: 'auto',
    ...(currentOnly ? {} : { forecast_days: '7' }),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  }
}

function normalizeCurrent(current) {
  return {
    time: current.time,
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    isDay: Boolean(current.is_day),
    cloudCover: current.cloud_cover,
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    pressure: current.pressure_msl,
    visibility: current.visibility,
    uvIndex: current.uv_index,
  }
}

export async function fetchForecast(location, signal, options = {}) {
  const url = buildUrl(FORECAST_URL, forecastParams(location))
  const data = await requestJson(url, signal, CACHE.forecast, options.bypassCache)

  if (!data.current || !data.hourly?.time?.length || !data.daily?.time?.length) {
    throw new Error('Weather data is unavailable for this location. Please try another city.')
  }

  const hourly = data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m?.[index],
    feelsLike: data.hourly.apparent_temperature?.[index],
    isDay: Boolean(data.hourly.is_day?.[index]),
    weatherCode: data.hourly.weather_code?.[index] ?? 0,
    precipitationProbability: data.hourly.precipitation_probability?.[index] ?? 0,
    humidity: data.hourly.relative_humidity_2m?.[index],
    windSpeed: data.hourly.wind_speed_10m?.[index],
    uvIndex: data.hourly.uv_index?.[index] ?? 0,
  }))

  const daily = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code?.[index] ?? 0,
    max: data.daily.temperature_2m_max?.[index],
    min: data.daily.temperature_2m_min?.[index],
    sunrise: data.daily.sunrise?.[index],
    sunset: data.daily.sunset?.[index],
    precipitationProbability: data.daily.precipitation_probability_max?.[index] ?? 0,
    precipitationSum: data.daily.precipitation_sum?.[index] ?? 0,
    windSpeed: data.daily.wind_speed_10m_max?.[index],
    windDirection: data.daily.wind_direction_10m_dominant?.[index],
    uvIndex: data.daily.uv_index_max?.[index] ?? 0,
  }))

  return {
    timezone: data.timezone ?? location.timezone ?? 'UTC',
    timezoneAbbreviation: data.timezone_abbreviation ?? '',
    utcOffsetSeconds: data.utc_offset_seconds ?? 0,
    coordinates: { latitude: data.latitude, longitude: data.longitude },
    current: normalizeCurrent(data.current),
    hourly,
    daily,
    fetchedAt: Date.now(),
  }
}

/** Lightweight request used by saved-location cards. */
export async function fetchCurrentConditions(location, signal) {
  const url = buildUrl(FORECAST_URL, forecastParams(location, { currentOnly: true }))
  const data = await requestJson(url, signal, CACHE.forecast)
  if (!data.current) throw new Error('No current conditions available.')
  return normalizeCurrent(data.current)
}

export async function fetchAirQuality(location, signal, options = {}) {
  const url = buildUrl(AIR_URL, {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone',
    timezone: 'auto',
  })
  const data = await requestJson(url, signal, CACHE.air, options.bypassCache)
  const current = data.current
  if (!current) throw new Error('Air quality data is unavailable for this location.')

  return {
    time: current.time,
    aqi: current.us_aqi,
    pm25: current.pm2_5,
    pm10: current.pm10,
    carbonMonoxide: current.carbon_monoxide,
    nitrogenDioxide: current.nitrogen_dioxide,
    ozone: current.ozone,
    fetchedAt: Date.now(),
  }
}

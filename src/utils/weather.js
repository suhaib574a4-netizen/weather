const WEATHER_GROUPS = [
  { codes: [0], label: 'Clear sky', short: 'Clear', icon: 'clear', category: 'clear' },
  { codes: [1], label: 'Mainly clear', short: 'Mainly clear', icon: 'partly', category: 'partly' },
  { codes: [2], label: 'Partly cloudy', short: 'Partly cloudy', icon: 'partly', category: 'partly' },
  { codes: [3], label: 'Overcast', short: 'Cloudy', icon: 'cloudy', category: 'cloudy' },
  { codes: [45, 48], label: 'Fog', short: 'Fog', icon: 'fog', category: 'fog' },
  { codes: [51, 53, 55], label: 'Drizzle', short: 'Drizzle', icon: 'drizzle', category: 'drizzle' },
  { codes: [56, 57], label: 'Freezing drizzle', short: 'Freezing drizzle', icon: 'drizzle', category: 'drizzle' },
  { codes: [61, 63, 65], label: 'Rain', short: 'Rain', icon: 'rain', category: 'rain' },
  { codes: [66, 67], label: 'Freezing rain', short: 'Freezing rain', icon: 'rain', category: 'rain' },
  { codes: [71, 73, 75, 77], label: 'Snowfall', short: 'Snow', icon: 'snow', category: 'snow' },
  { codes: [80, 81, 82], label: 'Rain showers', short: 'Showers', icon: 'rain', category: 'rain' },
  { codes: [85, 86], label: 'Snow showers', short: 'Snow showers', icon: 'snow', category: 'snow' },
  { codes: [95], label: 'Thunderstorm', short: 'Thunderstorm', icon: 'thunderstorm', category: 'storm' },
  { codes: [96, 99], label: 'Thunderstorm with hail', short: 'Storm & hail', icon: 'thunderstorm', category: 'storm' },
]

const CODE_TO_GROUP = new Map(
  WEATHER_GROUPS.flatMap((group) => group.codes.map((code) => [code, group])),
)

const FALLBACK = {
  label: 'Unknown conditions',
  short: 'Unknown',
  icon: 'cloudy',
  category: 'cloudy',
}

function round(value) {
  const rounded = Math.round(value)
  return Object.is(rounded, -0) ? 0 : rounded
}

export function toTemperature(celsius, tempUnit) {
  if (!Number.isFinite(celsius)) return null
  return round(tempUnit === 'F' ? celsius * (9 / 5) + 32 : celsius)
}

export function formatTemperature(celsius, tempUnit = 'C') {
  const value = toTemperature(celsius, tempUnit)
  return value === null ? '--°' : `${value}°${tempUnit}`
}

export function formatDelta(celsius, tempUnit = 'C') {
  const value = toTemperature(celsius, tempUnit)
  return value === null ? '--°' : `${value > 0 ? '+' : ''}${value}°`
}

export function toWind(kmh, windUnit) {
  if (!Number.isFinite(kmh)) return null
  return round(windUnit === 'mph' ? kmh * 0.621371 : kmh)
}

export function formatWind(kmh, windUnit = 'kmh') {
  const value = toWind(kmh, windUnit)
  return value === null ? '--' : `${value} ${windUnit === 'mph' ? 'mph' : 'km/h'}`
}

export function formatVisibility(meters, windUnit = 'kmh') {
  if (!Number.isFinite(meters)) return '--'
  if (windUnit === 'mph') {
    const miles = meters / 1609.344
    return miles < 0.1 ? `${round(meters)} m` : `${miles.toFixed(1)} mi`
  }
  const km = meters / 1000
  return km < 1 ? `${round(meters)} m` : `${km.toFixed(1)} km`
}

export function formatPressure(hpa) {
  return Number.isFinite(hpa) ? `${round(hpa)} hPa` : '--'
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export function getWindDirection(degrees) {
  if (!Number.isFinite(degrees)) return '--'
  return COMPASS[round(degrees / 22.5) % 16]
}

export function getWindDescription(degrees) {
  const direction = getWindDirection(degrees)
  if (direction === '--') return 'Wind direction unavailable'
  return `Wind from the ${direction}`
}

export function getWeatherInfo(code, isDay = true) {
  const group = CODE_TO_GROUP.get(code) ?? FALLBACK
  let icon = group.icon

  if (icon === 'clear') icon = isDay ? 'clear-day' : 'clear-night'
  if (icon === 'partly') icon = isDay ? 'partly-day' : 'partly-night'

  return {
    label: group.label,
    short: group.short,
    icon,
    category: group.category,
  }
}

export function sceneForWeather(info, isDay = true) {
  if (info.category === 'storm' || info.category === 'rain' || info.category === 'drizzle') return 'rain'
  if (info.category === 'snow') return 'snow'
  if (info.category === 'clear' && isDay) return 'sunny'
  if (info.category === 'clear' && !isDay) return 'night'
  return 'cloudy'
}

export function uvInfo(uv) {
  const value = Number.isFinite(uv) ? uv : 0
  if (value < 3) {
    return {
      label: 'Low',
      color: '#4ade9f',
      advice: 'No protection needed. Enjoy the outdoors.',
    }
  }
  if (value < 6) {
    return {
      label: 'Moderate',
      color: '#fbbf24',
      advice: 'Use sunscreen and seek shade around midday.',
    }
  }
  if (value < 8) {
    return {
      label: 'High',
      color: '#fb923c',
      advice: 'Wear SPF 30+, a hat and sunglasses.',
    }
  }
  if (value < 11) {
    return {
      label: 'Very high',
      color: '#fb7185',
      advice: 'Avoid prolonged sun exposure between 10am and 4pm.',
    }
  }
  return {
    label: 'Extreme',
    color: '#c084fc',
    advice: 'Stay indoors during peak hours and use maximum protection.',
  }
}

export function aqiInfo(aqi) {
  const value = Number.isFinite(aqi) ? aqi : 0
  if (value <= 50) {
    return {
      label: 'Good',
      color: '#4ade9f',
      description: 'Air quality is satisfactory and poses little or no risk.',
      recommendation: 'Ideal conditions for outdoor activity.',
    }
  }
  if (value <= 100) {
    return {
      label: 'Moderate',
      color: '#fbbf24',
      description: 'Air quality is acceptable for most people.',
      recommendation: 'Unusually sensitive people should consider limiting prolonged outdoor exertion.',
    }
  }
  if (value <= 150) {
    return {
      label: 'Sensitive groups',
      color: '#fb923c',
      description: 'Members of sensitive groups may experience health effects.',
      recommendation: 'Children, older adults and people with respiratory conditions should reduce outdoor exertion.',
    }
  }
  if (value <= 200) {
    return {
      label: 'Unhealthy',
      color: '#fb7185',
      description: 'Everyone may begin to experience health effects.',
      recommendation: 'Limit time outdoors and keep windows closed.',
    }
  }
  if (value <= 300) {
    return {
      label: 'Very unhealthy',
      color: '#c084fc',
      description: 'A health alert: the risk of effects is increased for everyone.',
      recommendation: 'Avoid outdoor activity and use air filtration indoors.',
    }
  }
  return {
    label: 'Hazardous',
    color: '#ef4444',
    description: 'Health warning of emergency conditions.',
    recommendation: 'Stay indoors and follow local public health guidance.',
  }
}

export function getLocationTitle(location) {
  return location?.name ?? 'Unknown location'
}

export function getLocationSubtitle(location) {
  if (!location) return ''
  return [location.admin1, location.country].filter(Boolean).join(', ')
}

export function getLocationLabel(location) {
  if (!location) return ''
  const subtitle = getLocationSubtitle(location)
  return subtitle ? `${location.name}, ${subtitle}` : location.name
}

export function getCoordinatesLabel(location) {
  if (!location) return ''
  return `${Math.abs(location.latitude).toFixed(2)}°${location.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(location.longitude).toFixed(2)}°${location.longitude >= 0 ? 'E' : 'W'}`
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

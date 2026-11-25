/**
 * Open-Meteo returns local times for the requested location when timezone=auto.
 * We format them from the ISO string directly so the browser's timezone never
 * shifts the displayed city time.
 */

function parts(iso) {
  const [date = '', time = ''] = String(iso ?? '').split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  return { date, time, year, month, day, hour, minute }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatHour(iso, clock = '24') {
  const { hour, minute } = parts(iso)
  if (clock === '24') return `${pad(hour)}:${pad(minute)}`
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${pad(minute)} ${suffix}`
}

export function formatCompactHour(iso, clock = '24') {
  const { hour } = parts(iso)
  if (clock === '24') return `${pad(hour)}:00`
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12} ${suffix}`
}

export function formatTimeRange(sunrise, sunset, clock = '24') {
  if (!sunrise || !sunset) return '--'
  return `${formatHour(sunrise, clock)} – ${formatHour(sunset, clock)}`
}

export function getHourKey(iso) {
  const { date, hour } = parts(iso)
  return `${date}T${pad(hour)}`
}

export function getUpcomingHours(hourly, currentTime, count = 24) {
  if (!hourly?.length) return []
  const currentKey = getHourKey(currentTime)
  const index = hourly.findIndex((hour) => getHourKey(hour.time) === currentKey)
  return hourly.slice(index < 0 ? 0 : index, (index < 0 ? 0 : index) + count)
}

export function hoursBetween(fromIso, toIso) {
  const from = parts(fromIso)
  const to = parts(toIso)
  const fromMs = Date.UTC(from.year, from.month - 1, from.day, from.hour)
  const toMs = Date.UTC(to.year, to.month - 1, to.day, to.hour)
  return Math.max(0, Math.round((toMs - fromMs) / 3600000))
}

function dateFromIso(date) {
  const { year, month, day } = parts(`${date}T00:00`)
  return new Date(Date.UTC(year, month - 1, day))
}

export function getForecastDayLabel(date, index) {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(dateFromIso(date))
}

export function getForecastLongDay(date, index) {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(dateFromIso(date))
}

export function getForecastFullDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromIso(date))
}

export function getForecastShortDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromIso(date))
}

export function getDayNumber(date) {
  return dateFromIso(date).getUTCDate()
}

export function formatUpdatedAt(timestamp) {
  if (!timestamp) return '--'
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

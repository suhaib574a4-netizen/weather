import AnalyticsGrid from '../components/charts/AnalyticsGrid'
import HourlyStrip from '../components/weather/HourlyStrip'
import { Panel, SectionHeading } from '../components/ui/Card'
import ViewHeader from '../components/ui/ViewHeader'
import WeatherGate from '../components/ui/WeatherGate'
import { useApp } from '../context/AppContext'
import { formatHour, getUpcomingHours } from '../utils/datetime'
import { formatTemperature, formatWind, getWeatherInfo } from '../utils/weather'
import WeatherIcon from '../components/WeatherIcon'
import { Droplets, Wind } from 'lucide-react'

function HourRow({ hour, index }) {
  const { settings } = useApp()
  const info = getWeatherInfo(hour.weatherCode, hour.isDay)
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] py-3 last:border-0">
      <span className={`w-16 shrink-0 text-xs font-bold sm:w-20 ${index === 0 ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
        {index === 0 ? 'Now' : formatHour(hour.time, settings.clock)}
      </span>
      <WeatherIcon name={info.icon} className="!h-6 !w-6 shrink-0" />
      <span className="hidden min-w-0 flex-1 truncate text-xs text-[var(--muted)] sm:block">{info.label}</span>
      <span className="flex w-20 shrink-0 items-center justify-end gap-1 text-[11px] text-[var(--muted)]">
        <Droplets size={12} className="text-[#6db9ff]" /> {hour.precipitationProbability}%
      </span>
      <span className="hidden w-24 shrink-0 items-center justify-end gap-1 text-[11px] text-[var(--muted)] md:flex">
        <Wind size={12} className="text-[#a9bfff]" /> {formatWind(hour.windSpeed, settings.windUnit)}
      </span>
      <span className="w-14 shrink-0 text-right text-sm font-bold">{formatTemperature(hour.temperature, settings.tempUnit)}</span>
    </div>
  )
}

export default function HourlyView() {
  const { weather } = useApp()
  const hours = weather.data
    ? getUpcomingHours(weather.data.hourly, weather.data.current.time, 24)
    : []

  return (
    <WeatherGate>
      <div className="fade-in space-y-6">
        <ViewHeader eyebrow="Hour by hour" title="Hourly forecast" />
        <HourlyStrip count={24} title="Next 24 hours" description="Swipe or use the arrows to explore the full day." />
        <AnalyticsGrid only={['temperature', 'rain', 'humidity', 'wind']} />
        <Panel>
          <SectionHeading eyebrow="Table view" title="All 24 hours" description="Temperature, rain probability and wind for every hour ahead." />
          <div className="mt-4">
            {hours.map((hour, index) => (
              <HourRow key={hour.time} hour={hour} index={index} />
            ))}
          </div>
        </Panel>
      </div>
    </WeatherGate>
  )
}

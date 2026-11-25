import { Sunrise, Sunset, Waves } from 'lucide-react'
import AnalyticsGrid from '../components/charts/AnalyticsGrid'
import DailyList from '../components/weather/DailyList'
import { Panel, SectionHeading } from '../components/ui/Card'
import ViewHeader from '../components/ui/ViewHeader'
import WeatherGate from '../components/ui/WeatherGate'
import { useApp } from '../context/AppContext'
import { formatHour, getForecastLongDay, getForecastShortDate } from '../utils/datetime'
import { formatWind, getWindDirection, uvInfo } from '../utils/weather'

export default function DailyView() {
  const { weather, settings } = useApp()
  const days = weather.data?.daily ?? []

  return (
    <WeatherGate>
      <div className="fade-in space-y-6">
        <ViewHeader eyebrow="Week ahead" title="7-day forecast" />

        <DailyList detailed />

        <AnalyticsGrid only={['weekly', 'rain']} />

        <Panel>
          <SectionHeading eyebrow="Daily details" title="Sun, wind and UV" description="Supporting conditions for each day of the week." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {days.map((day, index) => {
              const uv = uvInfo(day.uvIndex)
              return (
                <div key={day.date} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{getForecastLongDay(day.date, index)}</p>
                    <span className="faint text-[11px]">{getForecastShortDate(day.date)}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <span className="flex items-center gap-2 text-[var(--muted)]">
                      <Sunrise size={14} className="text-[var(--warning)]" />
                      {formatHour(day.sunrise, settings.clock)}
                    </span>
                    <span className="flex items-center gap-2 text-[var(--muted)]">
                      <Sunset size={14} className="text-[var(--warning)]" />
                      {formatHour(day.sunset, settings.clock)}
                    </span>
                    <span className="flex items-center gap-2 text-[var(--muted)]">
                      <Waves size={14} className="text-[#8bddff]" />
                      {formatWind(day.windSpeed, settings.windUnit)} {getWindDirection(day.windDirection)}
                    </span>
                    <span className="flex items-center gap-2 text-[var(--muted)]">
                      <span className="h-2 w-2 rounded-full" style={{ background: uv.color }} />
                      UV {day.uvIndex.toFixed(1)} · {uv.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </WeatherGate>
  )
}

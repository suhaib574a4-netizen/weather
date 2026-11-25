import { Droplets, Wind } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getForecastShortDate, getForecastDayLabel } from '../../utils/datetime'
import { formatTemperature, formatWind, getWeatherInfo } from '../../utils/weather'
import WeatherIcon from '../WeatherIcon'
import { Panel, SectionHeading } from '../ui/Card'

export default function DailyList({ detailed = false, action }) {
  const { weather, settings } = useApp()
  const days = weather.data.daily
  const allMin = Math.min(...days.map((day) => day.min))
  const allMax = Math.max(...days.map((day) => day.max))
  const span = Math.max(1, allMax - allMin)

  return (
    <Panel>
      <SectionHeading
        eyebrow="Seven days"
        title="Weekly forecast"
        description="Daily highs, lows, rain chance and wind conditions."
        action={action}
      />
      <div className="mt-4 divide-y divide-[var(--border)]">
        {days.map((day, index) => {
          const info = getWeatherInfo(day.weatherCode, true)
          const left = ((day.min - allMin) / span) * 100
          const width = Math.max(6, ((day.max - day.min) / span) * 100)

          return (
            <div key={day.date} className="flex items-center gap-3 py-3.5 sm:gap-4">
              <div className="w-[78px] shrink-0 sm:w-[110px]">
                <p className="text-sm font-bold">{getForecastDayLabel(day.date, index)}</p>
                <p className="faint text-[11px]">{getForecastShortDate(day.date)}</p>
              </div>

              <div className="shrink-0 text-[var(--accent)]">
                <WeatherIcon name={info.icon} className="!h-7 !w-7 sm:!h-8 sm:!w-8" />
              </div>

              <div className="hidden min-w-0 flex-1 sm:block">
                <p className="truncate text-sm font-medium">{info.label}</p>
                <p className="faint flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Droplets size={11} className="text-[#6db9ff]" /> {day.precipitationProbability}% rain
                  </span>
                  {detailed && (
                    <span className="inline-flex items-center gap-1">
                      <Wind size={11} className="text-[#a9bfff]" /> {formatWind(day.windSpeed, settings.windUnit)}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-1 items-center gap-2 sm:w-[210px] sm:flex-none lg:w-[260px]">
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-[var(--muted)]">
                  {formatTemperature(day.min, settings.tempUnit)}
                </span>
                <div className="relative h-1.5 min-w-[40px] flex-1 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#6db9ff] via-[#63d3ff] to-[#ffc978]"
                    style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-xs font-bold">{formatTemperature(day.max, settings.tempUnit)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

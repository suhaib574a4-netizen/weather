import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Droplets, Wind } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCompactHour, getUpcomingHours } from '../../utils/datetime'
import { formatTemperature, formatWind, getWeatherInfo } from '../../utils/weather'
import WeatherIcon from '../WeatherIcon'
import { Panel, SectionHeading } from '../ui/Card'

export default function HourlyStrip({ count = 24, title = 'Hourly outlook', description = 'Live hour-by-hour conditions in your selected city.', action }) {
  const { weather, settings } = useApp()
  const scroller = useRef(null)
  const hours = getUpcomingHours(weather.data.hourly, weather.data.current.time, count)

  const scroll = (direction) => {
    scroller.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })
  }

  return (
    <Panel>
      <SectionHeading
        eyebrow="Next hours"
        title={title}
        description={description}
        action={
          action ?? (
            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" className="icon-btn !h-9 !w-9" onClick={() => scroll(-1)} aria-label="Scroll hourly forecast left">
                <ChevronLeft size={17} />
              </button>
              <button type="button" className="icon-btn !h-9 !w-9" onClick={() => scroll(1)} aria-label="Scroll hourly forecast right">
                <ChevronRight size={17} />
              </button>
            </div>
          )
        }
      />

      <div ref={scroller} className="no-scrollbar -mx-1 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        {hours.map((hour, index) => {
          const info = getWeatherInfo(hour.weatherCode, hour.isDay)
          return (
            <div
              key={hour.time}
              className="flex w-[106px] shrink-0 snap-start flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2 py-3.5 text-center transition hover:border-[var(--border-strong)] sm:w-[116px]"
            >
              <span className={`text-[11px] font-bold ${index === 0 ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                {index === 0 ? 'Now' : formatCompactHour(hour.time, settings.clock)}
              </span>
              <WeatherIcon name={info.icon} className="my-3 !h-8 !w-8" />
              <span className="display-font text-lg font-bold">{formatTemperature(hour.temperature, settings.tempUnit)}</span>
              <div className="mt-3 flex w-full flex-col gap-1.5 border-t border-[var(--border)] pt-2.5 text-[10px] text-[var(--muted)]">
                <span className="flex items-center justify-center gap-1">
                  <Droplets size={11} className="text-[#6db9ff]" /> {hour.precipitationProbability}%
                </span>
                <span className="flex items-center justify-center gap-1">
                  <Wind size={11} className="text-[#a9bfff]" /> {formatWind(hour.windSpeed, settings.windUnit)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

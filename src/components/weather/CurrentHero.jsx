import { Bookmark, MapPin, Radio, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatHour } from '../../utils/datetime'
import {
  formatTemperature,
  getCoordinatesLabel,
  getLocationSubtitle,
  getWeatherInfo,
} from '../../utils/weather'
import WeatherIcon from '../WeatherIcon'
import { Panel } from '../ui/Card'

export default function CurrentHero() {
  const { location, weather, settings, isFavorite, toggleFavorite } = useApp()
  const current = weather.data.current
  const info = getWeatherInfo(current.weatherCode, current.isDay)
  const daily = weather.data.daily[0]
  const favorite = isFavorite(location)

  return (
    <Panel className="relative min-h-[330px] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_15%_0%,rgba(70,150,255,0.22),transparent_70%),radial-gradient(520px_320px_at_100%_100%,rgba(139,124,255,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[rgba(99,211,255,0.14)]" />
      <div className="pointer-events-none absolute -right-4 -top-12 h-56 w-56 rounded-full border border-[rgba(99,211,255,0.1)]" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,222,159,0.3)] bg-[rgba(74,222,159,0.1)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--success)]">
              <Radio size={11} /> Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
              {formatHour(current.time, settings.clock)} local · {weather.data.timezoneAbbreviation || weather.data.timezone}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleFavorite(location)}
            className="icon-btn"
            title={favorite ? 'Remove from favourites' : 'Save to favourites'}
            aria-label={favorite ? 'Remove from favourites' : 'Save to favourites'}
          >
            <Star size={17} className={favorite ? 'fill-[var(--warning)] text-[var(--warning)]' : ''} />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <MapPin size={15} />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">{location.name}</span>
            </div>
            <h1 className="display-font mt-1 truncate text-lg font-semibold text-[var(--muted)]">
              {getLocationSubtitle(location) || 'Current conditions'}
            </h1>

            <div className="mt-4 flex items-start gap-2 sm:gap-4">
              <span className="display-font text-[clamp(4.5rem,10vw,8rem)] font-extrabold leading-[0.85] tracking-[-0.07em]">
                {formatTemperature(current.temperature, settings.tempUnit).replace(/°[CF]$/, '')}
                <span className="ml-1 align-top text-[0.32em] font-bold tracking-normal text-[var(--accent)]">
                  °{settings.tempUnit}
                </span>
              </span>
              <span className="mt-1 text-[var(--accent)] sm:mt-2">
                <WeatherIcon name={info.icon} className="!h-14 !w-14 sm:!h-20 sm:!w-20" />
              </span>
            </div>

            <p className="display-font mt-4 text-2xl font-bold tracking-tight">{info.label}</p>
            <p className="muted mt-1 text-sm">
              Feels like <span className="font-semibold text-[var(--text)]">{formatTemperature(current.feelsLike, settings.tempUnit)}</span>
              {daily && (
                <>
                  <span className="mx-2 text-[var(--border-strong)]">·</span>
                  H <span className="font-semibold text-[var(--text)]">{formatTemperature(daily.max, settings.tempUnit)}</span>
                  <span className="mx-1.5 text-[var(--border-strong)]">/</span>
                  L <span className="font-semibold text-[var(--text)]">{formatTemperature(daily.min, settings.tempUnit)}</span>
                </>
              )}
            </p>
          </div>

          <div className="hidden shrink-0 flex-col items-end gap-3 text-right sm:flex">
            <div className="grid h-28 w-28 place-items-center rounded-full border border-[rgba(99,211,255,0.18)] bg-[rgba(99,211,255,0.05)] sm:h-36 sm:w-36">
              <WeatherIcon name={info.icon} className="!h-16 !w-16 sm:!h-24 sm:!w-24" />
            </div>
            <div className="faint flex items-center gap-1.5 text-[11px]">
              <Bookmark size={12} /> {getCoordinatesLabel(location)}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

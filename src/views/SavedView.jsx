import { useEffect, useState } from 'react'
import { Bookmark, Clock3, LoaderCircle, MapPin, Star, Trash2 } from 'lucide-react'
import WeatherIcon from '../components/WeatherIcon'
import { Panel, SectionHeading } from '../components/ui/Card'
import { EmptyState } from '../components/ui/StateMessage'
import ViewHeader from '../components/ui/ViewHeader'
import { useApp } from '../context/AppContext'
import { fetchCurrentConditions } from '../services/weatherApi'
import { formatTemperature, getLocationSubtitle, getWeatherInfo } from '../utils/weather'
import { Skeleton } from '../components/ui/Skeleton'

const keyOf = (item) => `${Number(item.latitude).toFixed(3)},${Number(item.longitude).toFixed(3)}`

function FavoriteCard({ location }) {
  const { settings, selectLocation, removeFavorite } = useApp()
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading', data: null })
    fetchCurrentConditions(location, controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', data: null })
      })
    return () => controller.abort()
  }, [keyOf(location)])

  const info = state.data ? getWeatherInfo(state.data.weatherCode, state.data.isDay) : null

  return (
    <div className="panel panel-hover group p-4">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => selectLocation(location)} className="min-w-0 text-left">
          <p className="truncate text-sm font-bold">{location.name}</p>
          <p className="faint truncate text-[11px]">{getLocationSubtitle(location) || 'Saved city'}</p>
        </button>
        <button
          type="button"
          onClick={() => removeFavorite(location)}
          className="rounded-lg p-1.5 text-[var(--faint)] transition hover:bg-[rgba(251,113,133,0.1)] hover:text-[var(--danger)]"
          aria-label={`Remove ${location.name} from favourites`}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        {state.status === 'loading' && (
          <>
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </>
        )}
        {state.status === 'error' && <span className="text-xs text-[var(--danger)]">Conditions unavailable</span>}
        {state.status === 'success' && info && (
          <>
            <div>
              <p className="display-font text-3xl font-extrabold tracking-tight">
                {formatTemperature(state.data.temperature, settings.tempUnit)}
              </p>
              <p className="muted mt-0.5 text-[11px]">{info.short}</p>
            </div>
            <span className="text-[var(--accent)]"><WeatherIcon name={info.icon} className="!h-10 !w-10" /></span>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => selectLocation(location)}
        className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 text-[11px] font-bold text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
      >
        View full forecast
      </button>
    </div>
  )
}

export default function SavedView() {
  const { favorites, recent, selectLocation, clearRecent, geo } = useApp()

  async function locate() {
    const found = await geo.locate()
    if (found) selectLocation(found)
  }

  return (
    <div className="fade-in space-y-6">
      <ViewHeader
        eyebrow="Your places"
        title="Saved locations"
        description="Keep an eye on the cities that matter to you. Favourites and recent searches are stored on this device."
        action={
          <button
            type="button"
            onClick={locate}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-semibold transition hover:bg-[var(--surface-hover)]"
          >
            {geo.status === 'loading' ? <LoaderCircle size={15} className="animate-spin" /> : <MapPin size={15} />}
            Use my location
          </button>
        }
      />
      {geo.status === 'error' && (
        <p className="rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.08)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
          {geo.error}
        </p>
      )}

      <section>
        <SectionHeading eyebrow="Pinned" title="Favourite cities" description="Live conditions for each saved city." />
        {favorites.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Star}
              title="No favourites yet"
              description="Use the star icon next to any search result or forecast to pin a city here."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((location) => (
              <FavoriteCard key={keyOf(location)} location={location} />
            ))}
          </div>
        )}
      </section>

      <Panel>
        <SectionHeading
          eyebrow="History"
          title="Recently searched"
          action={
            recent.length > 0 ? (
              <button type="button" onClick={clearRecent} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--danger)] transition hover:opacity-80">
                <Trash2 size={13} /> Clear history
              </button>
            ) : undefined
          }
        />
        {recent.length === 0 ? (
          <p className="muted mt-5 rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm">
            Cities you view will appear here automatically.
          </p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((location) => (
              <div key={keyOf(location)} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <Clock3 size={16} className="shrink-0 text-[var(--faint)]" />
                <button type="button" onClick={() => selectLocation(location)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold">{location.name}</span>
                  <span className="faint block truncate text-[11px]">{getLocationSubtitle(location) || 'Location'}</span>
                </button>
                <Bookmark size={14} className="shrink-0 text-[var(--faint)]" />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

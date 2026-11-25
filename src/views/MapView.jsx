import { Crosshair, Info, LoaderCircle, MapPin, Star } from 'lucide-react'
import WeatherMap from '../components/map/WeatherMap'
import { Panel, SectionHeading } from '../components/ui/Card'
import ViewHeader from '../components/ui/ViewHeader'
import { useApp } from '../context/AppContext'
import { getLocationSubtitle } from '../utils/weather'

export default function MapView() {
  const { location, favorites, recent, selectLocation, geo } = useApp()
  const keyOf = (item) => `${item.latitude},${item.longitude}`
  const saved = [...favorites, ...recent].filter(
    (item, index, array) => keyOf(item) !== keyOf(location) && array.findIndex((other) => keyOf(other) === keyOf(item)) === index,
  )

  async function locate() {
    const found = await geo.locate()
    if (found) selectLocation(found)
  }

  return (
    <div className="fade-in space-y-6">
      <ViewHeader
        eyebrow="Explore"
        title="Weather map"
        description="Select a city on the map or from your saved places to load its live forecast. Zoom and pan freely."
        action={
          <button type="button" onClick={locate} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-semibold transition hover:bg-[var(--surface-hover)]">
            {geo.status === 'loading' ? <LoaderCircle size={15} className="animate-spin" /> : <Crosshair size={15} />}
            Use my location
          </button>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <WeatherMap />
      </Panel>

      {geo.status === 'error' && (
        <p className="rounded-2xl border border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.08)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
          {geo.error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel>
          <SectionHeading eyebrow="Map key" title="Marker legend" />
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#8ee2ff] to-[#4fb6f5] ring-4 ring-[rgba(99,211,255,0.16)]" />
              <span className="text-[var(--muted)]">Currently selected location</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#c3b2ff] to-[#8b7cff]" />
              <span className="text-[var(--muted)]">Favourite city</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#a9bed6] to-[#6d8bad]" />
              <span className="text-[var(--muted)]">Recently viewed</span>
            </div>
          </div>
          <div className="mt-5 flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[11px] leading-relaxed text-[var(--muted)]">
            <Info size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            This map shows city locations only. No live radar or weather overlay is available from the free data sources, so none is displayed.
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Quick jump" title="Saved & recent cities" />
          {saved.length === 0 ? (
            <p className="muted mt-6 rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm">
              Save cities from the search bar or a forecast view and they will appear here.
            </p>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {saved.map((item) => (
                <button
                  key={keyOf(item)}
                  type="button"
                  onClick={() => selectLocation(item)}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                >
                  <MapPin size={16} className="shrink-0 text-[var(--accent)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.name}</span>
                    <span className="faint block truncate text-[11px]">{getLocationSubtitle(item) || 'Saved location'}</span>
                  </span>
                  {favorites.some((favorite) => keyOf(favorite) === keyOf(item)) && (
                    <Star size={14} className="shrink-0 fill-[var(--warning)] text-[var(--warning)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

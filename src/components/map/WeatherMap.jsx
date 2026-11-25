import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { Crosshair, Maximize2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../../context/AppContext'
import { getLocationSubtitle } from '../../utils/weather'

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

function pinIcon(location, variant) {
  const initial = escapeHtml(location.name?.charAt(0)?.toUpperCase() ?? '?')
  return L.divIcon({
    className: '',
    html: `<div class="map-pin map-pin--${variant}"><span>${initial}</span></div>`,
    iconSize: variant === 'selected' ? [44, 44] : [34, 34],
    iconAnchor: variant === 'selected' ? [22, 44] : [17, 34],
    popupAnchor: [0, -32],
  })
}

function MapFocus({ location, locations, fitSignal, recenterSignal }) {
  const map = useMap()

  useEffect(() => {
    if (location) map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 7), { duration: 1.1 })
  }, [location?.latitude, location?.longitude, recenterSignal, map])

  useEffect(() => {
    if (!fitSignal) return
    const points = locations.filter(Boolean).map((item) => [item.latitude, item.longitude])
    if (points.length > 1) map.fitBounds(points, { padding: [60, 60], maxZoom: 9 })
    else if (points.length) map.flyTo(points[0], 9, { duration: 1 })
  }, [fitSignal, map, locations])

  return null
}

export default function WeatherMap() {
  const { location, favorites, recent, selectLocation } = useApp()
  const [fitSignal, setFitSignal] = useState(0)
  const [recenterSignal, setRecenterSignal] = useState(0)

  const keyOf = (item) => `${Number(item.latitude).toFixed(3)},${Number(item.longitude).toFixed(3)}`
  const selectedKey = keyOf(location)
  const others = [...favorites, ...recent].filter(
    (item, index, array) => keyOf(item) !== selectedKey && array.findIndex((other) => keyOf(other) === keyOf(item)) === index,
  )
  const allLocations = [location, ...others]

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-[var(--border)] sm:h-[500px] lg:h-[580px]">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={7}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />

        <Marker position={[location.latitude, location.longitude]} icon={pinIcon(location, 'selected')}>
          <Popup>
            <div className="min-w-[150px]">
              <p className="text-sm font-bold">{location.name}</p>
              <p className="text-[11px] opacity-70">{getLocationSubtitle(location) || 'Selected location'}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">Current selection</p>
            </div>
          </Popup>
        </Marker>

        {others.map((item) => (
          <Marker
            key={keyOf(item)}
            position={[item.latitude, item.longitude]}
            icon={pinIcon(item, favorites.some((favorite) => keyOf(favorite) === keyOf(item)) ? 'favorite' : 'recent')}
            eventHandlers={{ click: () => selectLocation(item) }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-[11px] opacity-70">{getLocationSubtitle(item) || 'Saved location'}</p>
                <button
                  type="button"
                  onClick={() => selectLocation(item)}
                  className="mt-2 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]"
                >
                  View forecast
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapFocus location={location} locations={allLocations} fitSignal={fitSignal} recenterSignal={recenterSignal} />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-wrap items-center gap-2">
        <span className="pointer-events-auto rounded-xl border border-[var(--border)] bg-[rgba(8,20,38,0.86)] px-3 py-2 text-[11px] font-semibold text-[var(--text)] backdrop-blur-xl light:bg-[rgba(255,255,255,0.9)]">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
          {location.name} · selected
        </span>
      </div>

      <div className="absolute right-3 top-3 z-[400] flex gap-2">
        <button
          type="button"
          onClick={() => setFitSignal((value) => value + 1)}
          className="icon-btn !h-9 !w-9 !bg-[rgba(8,20,38,0.86)] !backdrop-blur-xl light:!bg-[rgba(255,255,255,0.9)]"
          title="Fit all saved locations"
          aria-label="Fit all saved locations"
        >
          <Maximize2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => setRecenterSignal((value) => value + 1)}
          className="icon-btn !h-9 !w-9 !bg-[rgba(8,20,38,0.86)] !backdrop-blur-xl light:!bg-[rgba(255,255,255,0.9)]"
          title="Recenter on selected city"
          aria-label="Recenter on selected city"
        >
          <Crosshair size={16} />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg bg-[rgba(8,20,38,0.8)] px-2.5 py-1.5 text-[10px] text-[var(--muted)] backdrop-blur light:bg-[rgba(255,255,255,0.88)]">
        City markers only · no live radar overlay available
      </div>
    </div>
  )
}

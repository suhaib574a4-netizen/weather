import { useState } from 'react'
import { Check, Database, LoaderCircle, MapPin, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { Panel, SegmentedControl, SectionHeading } from '../components/ui/Card'
import ViewHeader from '../components/ui/ViewHeader'
import { useApp, DEFAULT_SETTINGS } from '../context/AppContext'
import { clearWeatherCache } from '../services/weatherApi'
import { getCoordinatesLabel, getLocationSubtitle } from '../utils/weather'

function SettingRow({ title, description, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] py-4 last:border-0">
      <div className="min-w-0 max-w-md">
        <p className="text-sm font-bold">{title}</p>
        <p className="muted mt-1 text-xs leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default function SettingsView() {
  const { settings, updateSettings, resetSettings, location, favorites, recent, clearRecent, geo, selectLocation } = useApp()
  const [cacheCleared, setCacheCleared] = useState(false)

  async function locate() {
    const found = await geo.locate()
    if (found) selectLocation(found)
  }

  return (
    <div className="fade-in space-y-6">
      <ViewHeader eyebrow="Preferences" title="Settings" description="Make SKYCAST PRO feel like yours. Preferences are saved automatically on this device." />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <SectionHeading eyebrow="Units" title="Measurement & time" />
          <div className="mt-3">
            <SettingRow title="Temperature" description="Choose Celsius or Fahrenheit across every forecast, chart and card.">
              <SegmentedControl
                label="Temperature unit"
                value={settings.tempUnit}
                options={[{ value: 'C', label: 'Celsius' }, { value: 'F', label: 'Fahrenheit' }]}
                onChange={(tempUnit) => updateSettings({ tempUnit })}
              />
            </SettingRow>
            <SettingRow title="Wind speed" description="Display wind in kilometres per hour or miles per hour. Visibility follows the same system.">
              <SegmentedControl
                label="Wind unit"
                value={settings.windUnit}
                options={[{ value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }]}
                onChange={(windUnit) => updateSettings({ windUnit })}
              />
            </SettingRow>
            <SettingRow title="Clock format" description="Times are always shown in the selected city's local timezone.">
              <SegmentedControl
                label="Clock format"
                value={settings.clock}
                options={[{ value: '24', label: '24-hour' }, { value: '12', label: '12-hour' }]}
                onChange={(clock) => updateSettings({ clock })}
              />
            </SettingRow>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <SectionHeading eyebrow="Appearance" title="Theme & updates" />
            <div className="mt-3">
              <SettingRow title="Appearance" description="Dark mode for late-night forecasting, light mode for bright days.">
                <SegmentedControl
                  label="Theme"
                  value={settings.theme}
                  options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
                  onChange={(theme) => updateSettings({ theme })}
                />
              </SettingRow>
              <SettingRow title="Automatic refresh" description="Weather data is refreshed quietly in the background while the app is open.">
                <SegmentedControl
                  label="Refresh interval"
                  value={String(settings.refreshMinutes)}
                  options={[
                    { value: '0', label: 'Off' },
                    { value: '15', label: '15m' },
                    { value: '30', label: '30m' },
                    { value: '60', label: '60m' },
                  ]}
                  onChange={(value) => updateSettings({ refreshMinutes: Number(value) })}
                />
              </SettingRow>
            </div>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Location" title="Location settings" />
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{location.name}</p>
                  <p className="muted text-xs">{getLocationSubtitle(location) || 'Selected location'}</p>
                  <p className="faint mt-1 text-[11px]">{getCoordinatesLabel(location)} · {location.timezone}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={locate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-semibold transition hover:bg-[var(--surface-hover)]"
            >
              {geo.status === 'loading' ? <LoaderCircle size={15} className="animate-spin" /> : <MapPin size={15} />}
              Detect my location
            </button>
            {geo.status === 'error' && <p className="mt-3 text-xs text-[var(--danger)]">{geo.error}</p>}
            <p className="faint mt-4 text-[11px] leading-relaxed">
              Your coordinates are used only to request nearby weather data. They are never uploaded to a SKYCAST PRO server — there isn't one.
            </p>
          </Panel>
        </div>
      </div>

      <Panel>
        <SectionHeading eyebrow="Privacy & data" title="Your device, your data" description="SKYCAST PRO runs entirely in your browser with free public APIs." />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <ShieldCheck size={19} className="text-[var(--success)]" />
            <p className="mt-3 text-sm font-bold">No account needed</p>
            <p className="muted mt-1.5 text-xs leading-relaxed">No sign-up, no tracking for weather requests, and no API keys to manage.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <Database size={19} className="text-[var(--accent)]" />
            <p className="mt-3 text-sm font-bold">Smart caching</p>
            <p className="muted mt-1.5 text-xs leading-relaxed">Recent forecasts and city searches are cached in memory to reduce requests.</p>
            <button
              type="button"
              onClick={() => {
                clearWeatherCache()
                setCacheCleared(true)
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] hover:opacity-80"
            >
              {cacheCleared ? <Check size={13} /> : <Trash2 size={13} />}
              {cacheCleared ? 'Cache cleared' : 'Clear cached data'}
            </button>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <RotateCcw size={19} className="text-[var(--warning)]" />
            <p className="mt-3 text-sm font-bold">Reset preferences</p>
            <p className="muted mt-1.5 text-xs leading-relaxed">Restore units, theme, clock and refresh settings to their defaults.</p>
            <button
              type="button"
              onClick={() => resetSettings()}
              className="mt-3 text-[11px] font-bold text-[var(--warning)] hover:opacity-80"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="muted text-xs">
            Saved on this device: <span className="font-semibold text-[var(--text)]">{favorites.length}</span> favourites ·{' '}
            <span className="font-semibold text-[var(--text)]">{recent.length}</span> recent cities
          </p>
          {recent.length > 0 && (
            <button type="button" onClick={clearRecent} className="text-[11px] font-bold text-[var(--danger)] hover:opacity-80">
              Clear search history
            </button>
          )}
        </div>
        <p className="faint mt-3 text-[10px]">
          Defaults: {DEFAULT_SETTINGS.tempUnit === 'C' ? 'Celsius' : 'Fahrenheit'}, dark theme, 24-hour clock, 15-minute refresh.
        </p>
      </Panel>
    </div>
  )
}

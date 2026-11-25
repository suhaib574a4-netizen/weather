import { CloudSun, Crosshair, LoaderCircle, Menu, Moon, RefreshCw, Sun } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatUpdatedAt } from '../../utils/datetime'
import SearchBar from '../search/SearchBar'
import { SegmentedControl } from '../ui/Card'

export default function TopBar({ onOpenMenu }) {
  const { settings, updateSettings, weather, geo, selectLocation } = useApp()

  async function locate() {
    const location = await geo.locate()
    if (location) selectLocation(location)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(6,16,31,0.72)] backdrop-blur-2xl light:bg-[rgba(240,246,253,0.82)]">
      <div className="mx-auto flex w-full max-w-[1700px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <button type="button" className="icon-btn" onClick={onOpenMenu} aria-label="Open navigation menu">
            <Menu size={19} />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#86e2ff] to-[#8b7cff] text-[#04121f]">
            <CloudSun size={19} />
          </span>
          <span className="display-font text-sm font-extrabold tracking-tight">
            SKYCAST <span className="text-[var(--accent)]">PRO</span>
          </span>
        </div>

        <div className="order-3 w-full md:order-none md:max-w-[520px] md:flex-1">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {weather.lastUpdated && (
            <span className="faint hidden text-[11px] font-medium xl:block">
              Updated {formatUpdatedAt(weather.lastUpdated)}
            </span>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={locate}
            title="Use current location"
            aria-label="Use current location"
          >
            {geo.status === 'loading' ? <LoaderCircle size={17} className="animate-spin" /> : <Crosshair size={17} />}
          </button>
          <button
            type="button"
            className={`icon-btn ${weather.isRefreshing ? 'is-active' : ''}`}
            onClick={weather.refresh}
            title="Refresh weather data"
            aria-label="Refresh weather data"
          >
            <RefreshCw size={17} className={weather.isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="hidden sm:block">
            <SegmentedControl
              label="Temperature unit"
              size="sm"
              value={settings.tempUnit}
              options={[{ value: 'C', label: '°C' }, { value: 'F', label: '°F' }]}
              onChange={(tempUnit) => updateSettings({ tempUnit })}
            />
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  )
}

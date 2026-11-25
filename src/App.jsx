import { lazy, Suspense, useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { MobileDrawer, MobileNav } from './components/layout/MobileNav'
import WeatherScene from './components/weather/WeatherScene'
import { DashboardSkeleton } from './components/ui/Skeleton'
import { useApp } from './context/AppContext'

const OverviewView = lazy(() => import('./views/OverviewView'))
const HourlyView = lazy(() => import('./views/HourlyView'))
const DailyView = lazy(() => import('./views/DailyView'))
const MapView = lazy(() => import('./views/MapView'))
const AirView = lazy(() => import('./views/AirView'))
const SavedView = lazy(() => import('./views/SavedView'))
const SettingsView = lazy(() => import('./views/SettingsView'))

const VIEWS = {
  overview: OverviewView,
  hourly: HourlyView,
  daily: DailyView,
  map: MapView,
  air: AirView,
  saved: SavedView,
  settings: SettingsView,
}

export default function App() {
  const { weather, favorites } = useApp()
  const [activeView, setActiveView] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  const ActiveView = VIEWS[activeView] ?? OverviewView
  const current = weather.data?.current

  return (
    <div className="app-root">
      <a className="skip-link" href="#main-content">Skip to weather content</a>
      <WeatherScene weatherCode={current?.weatherCode ?? 0} isDay={current?.isDay ?? true} />

      <div className="relative z-10 flex min-h-svh">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          favoritesCount={favorites.length}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenMenu={() => setDrawerOpen(true)} />
          <main id="main-content" className="mx-auto w-full max-w-[1700px] flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
            <Suspense fallback={<DashboardSkeleton />}>
              <ActiveView />
            </Suspense>
          </main>
          <footer className="hidden border-t border-[var(--border)] px-8 py-4 text-[11px] text-[var(--faint)] lg:block">
            <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} SKYCAST PRO · Weather intelligence for everyone</span>
              <span>Open-Meteo · OpenStreetMap</span>
            </div>
          </footer>
        </div>
      </div>

      <MobileNav activeView={activeView} onNavigate={setActiveView} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
      />
    </div>
  )
}

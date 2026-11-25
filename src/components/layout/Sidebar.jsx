import {
  Bookmark,
  CalendarDays,
  Clock3,
  CloudSun,
  LayoutDashboard,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Wind,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Current conditions' },
  { id: 'hourly', label: 'Hourly Forecast', icon: Clock3, description: 'Next 24 hours' },
  { id: 'daily', label: '7-Day Forecast', icon: CalendarDays, description: 'Week ahead' },
  { id: 'map', label: 'Weather Maps', icon: MapPinned, description: 'Explore locations' },
  { id: 'air', label: 'Air Quality', icon: Wind, description: 'Pollution & AQI' },
  { id: 'saved', label: 'Saved Locations', icon: Bookmark, description: 'Favourites & recent' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
]

export default function Sidebar({ activeView, onNavigate, collapsed, onToggleCollapse, favoritesCount }) {
  return (
    <aside
      className={`sticky top-0 hidden h-svh shrink-0 flex-col border-r border-[var(--border)] bg-[rgba(6,16,31,0.55)] backdrop-blur-2xl transition-[width] duration-300 light:bg-[rgba(247,250,255,0.78)] lg:flex ${
        collapsed ? 'w-[86px]' : 'w-[268px]'
      }`}
    >
      <div className={`flex h-[82px] items-center border-b border-[var(--border)] ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <button
          type="button"
          onClick={() => onNavigate('overview')}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="SKYCAST PRO home"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#86e2ff] via-[#5cb8ff] to-[#8b7cff] text-[#04121f] shadow-[0_8px_24px_-8px_rgba(99,211,255,0.9)]">
            <CloudSun size={22} strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="display-font block truncate text-[15px] font-extrabold tracking-tight">
                SKYCAST <span className="text-[var(--accent)]">PRO</span>
              </span>
              <span className="faint block truncate text-[10px] font-semibold uppercase tracking-[0.16em]">
                Weather intelligence
              </span>
            </span>
          )}
        </button>
      </div>

      <nav className="scroll-area flex-1 space-y-1.5 overflow-y-auto px-3 py-6" aria-label="Main navigation">
        {!collapsed && <p className="section-kicker mb-3 px-3 text-[10px]">Workspace</p>}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#8ee2ff] to-[#8b7cff]" />
              )}
              <Icon size={19} className={active ? 'text-[var(--accent)]' : ''} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                  <span className="faint block truncate text-[10px]">{item.description}</span>
                </span>
              )}
              {!collapsed && item.id === 'saved' && favoritesCount > 0 && (
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                  {favoritesCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--success)]">Live data</span>
            </div>
            <p className="muted mt-2 text-[11px] leading-relaxed">
              Forecasts powered by Open-Meteo. No account or API key required.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[12px] font-semibold text-[var(--faint)] transition hover:bg-[var(--surface)] hover:text-[var(--text)] ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && 'Collapse sidebar'}
        </button>
      </div>
    </aside>
  )
}

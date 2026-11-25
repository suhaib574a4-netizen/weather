import { useEffect, useState } from 'react'
import { CloudSun, MoreHorizontal, X } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'

const PRIMARY = ['overview', 'hourly', 'daily', 'map']

export function MobileNav({ activeView, onNavigate }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const items = PRIMARY.map((id) => NAV_ITEMS.find((item) => item.id === id))
  const extra = NAV_ITEMS.filter((item) => !PRIMARY.includes(item.id))

  function navigate(id) {
    onNavigate(id)
    setMoreOpen(false)
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(6,16,31,0.92)] backdrop-blur-2xl light:bg-[rgba(245,249,254,0.94)] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      {moreOpen && (
        <div className="absolute inset-x-0 bottom-full border-t border-[var(--border)] bg-[rgba(8,20,38,0.98)] p-3 shadow-2xl light:bg-[rgba(245,249,254,0.98)]">
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
            {extra.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-[11px] font-semibold transition ${
                    activeView === item.id
                      ? 'border-[rgba(99,211,255,0.4)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
                  }`}
                >
                  <Icon size={19} />
                  {item.label.replace(' Forecast', '').replace(' Locations', '')}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                active ? 'text-[var(--accent)]' : 'text-[var(--faint)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              {item.label.split(' ')[0]}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((value) => !value)}
          className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
            moreOpen ? 'text-[var(--accent)]' : 'text-[var(--faint)]'
          }`}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </div>
    </nav>
  )
}

export function MobileDrawer({ open, onClose, activeView, onNavigate }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
      <div className="absolute inset-y-0 left-0 w-[min(84vw,320px)] border-r border-[var(--border)] bg-[#08152a] p-5 shadow-2xl light:bg-[#f7faff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#86e2ff] to-[#8b7cff] text-[#04121f]">
              <CloudSun size={21} />
            </span>
            <span className="display-font text-sm font-extrabold">SKYCAST <span className="text-[var(--accent)]">PRO</span></span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close navigation menu">
            <X size={18} />
          </button>
        </div>
        <nav className="mt-8 space-y-1.5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                  active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface)]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <p className="faint absolute bottom-6 left-5 right-5 text-[11px] leading-relaxed">
          Live weather data from Open-Meteo. Free and open for everyone.
        </p>
      </div>
    </div>
  )
}

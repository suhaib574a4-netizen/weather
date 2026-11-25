import { Sunrise, Sunset } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { clamp } from '../../utils/weather'
import { formatHour } from '../../utils/datetime'
import { Panel, SectionHeading } from '../ui/Card'

function decimalHour(iso) {
  const time = String(iso ?? '').split('T')[1] ?? '00:00'
  const [hour, minute] = time.split(':').map(Number)
  return hour + minute / 60
}

function durationLabel(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return '--'
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  return `${whole}h ${String(minutes).padStart(2, '0')}m`
}

export default function SunArc() {
  const { weather, settings } = useApp()
  const today = weather.data.daily[0]
  const now = decimalHour(weather.data.current.time)
  const rise = decimalHour(today?.sunrise)
  const set = decimalHour(today?.sunset)
  const progress = clamp((now - rise) / Math.max(0.1, set - rise), 0, 1)
  const angle = Math.PI - progress * Math.PI
  const sunX = 130 + 110 * Math.cos(angle)
  const sunY = 110 - 110 * Math.sin(angle)

  return (
    <Panel className="flex h-full flex-col">
      <SectionHeading eyebrow="Daylight" title="Sun path" />

      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sunrise size={16} className="text-[var(--warning)]" />
          <span>
            <span className="faint block text-[10px] uppercase tracking-wider">Sunrise</span>
            <span className="font-semibold">{formatHour(today?.sunrise, settings.clock)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span>
            <span className="faint block text-[10px] uppercase tracking-wider">Sunset</span>
            <span className="font-semibold">{formatHour(today?.sunset, settings.clock)}</span>
          </span>
          <Sunset size={16} className="text-[var(--warning)]" />
        </div>
      </div>

      <div className="relative my-auto flex justify-center py-2">
        <svg viewBox="0 0 260 128" className="w-full max-w-[320px]" role="img" aria-label="Sun position for today">
          <defs>
            <linearGradient id="sunArc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b7cff" />
              <stop offset="50%" stopColor="#63d3ff" />
              <stop offset="100%" stopColor="#ffcc7a" />
            </linearGradient>
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line x1="10" y1="110" x2="250" y2="110" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" />
          <path d="M 20 110 A 110 110 0 0 1 240 110" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 6" />
          <path
            d="M 20 110 A 110 110 0 0 1 240 110"
            fill="none"
            stroke="url(#sunArc)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${progress * 100} 100`}
          />
          <circle cx={sunX} cy={sunY} r="18" fill="url(#sunGlow)" />
          <circle cx={sunX} cy={sunY} r="6" fill="#ffd98a" stroke="#fff3d2" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="hairline mb-3" />
      <div className="flex items-center justify-between text-xs">
        <span className="muted">Daylight</span>
        <span className="font-semibold">{durationLabel(set - rise)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="muted">{now < set ? 'Sunset in' : 'Dark for'}</span>
        <span className="font-semibold text-[var(--warning)]">
          {durationLabel(now < set ? set - now : 24 - set + now)}
        </span>
      </div>
    </Panel>
  )
}

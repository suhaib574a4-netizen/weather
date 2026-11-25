import { useApp } from '../../context/AppContext'
import { getLocationSubtitle } from '../../utils/weather'
import { Badge } from './Card'

export default function ViewHeader({ eyebrow, title, description, action }) {
  const { location, weather, settings } = useApp()

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="section-kicker">{eyebrow}</p>
        <h1 className="display-font mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
          {description ?? `${location.name}${getLocationSubtitle(location) ? `, ${getLocationSubtitle(location)}` : ''} · all times shown in the city's local timezone.`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {weather.lastUpdated && (
          <Badge tone="neutral">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Live · °{settings.tempUnit}
          </Badge>
        )}
        {action}
      </div>
    </div>
  )
}

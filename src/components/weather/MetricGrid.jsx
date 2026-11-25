import { Activity, Cloud, CloudRain, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  aqiInfo,
  clamp,
  formatPressure,
  formatVisibility,
  formatWind,
  getWindDirection,
  uvInfo,
} from '../../utils/weather'
import { Panel, ProgressBar } from '../ui/Card'

export default function MetricGrid() {
  const { weather, air, settings } = useApp()
  const current = weather.data.current
  const today = weather.data.daily[0]
  const uv = uvInfo(current.uvIndex)
  const aqi = air.data?.aqi ?? null
  const airCategory = aqiInfo(aqi ?? 0)

  const tiles = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${current.humidity ?? '--'}%`,
      sub: current.humidity > 70 ? 'Humid air' : current.humidity < 35 ? 'Dry air' : 'Comfortable',
      progress: current.humidity ?? 0,
      color: '#63d3ff',
    },
    {
      icon: Wind,
      label: 'Wind speed',
      value: formatWind(current.windSpeed, settings.windUnit),
      sub: `From the ${getWindDirection(current.windDirection)}`,
      progress: clamp((current.windSpeed / 60) * 100),
      color: '#8bddff',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: formatVisibility(current.visibility, settings.windUnit),
      sub: current.visibility > 10000 ? 'Excellent clarity' : current.visibility > 5000 ? 'Good clarity' : 'Reduced clarity',
      progress: clamp((current.visibility / 20000) * 100),
      color: '#a9bfff',
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: formatPressure(current.pressure),
      sub: current.pressure > 1015 ? 'High pressure' : current.pressure < 1005 ? 'Low pressure' : 'Steady',
      progress: clamp(((current.pressure - 980) / 60) * 100),
      color: '#b9a8ff',
    },
    {
      icon: Sun,
      label: 'UV index',
      value: Number.isFinite(current.uvIndex) ? current.uvIndex.toFixed(1) : '--',
      sub: uv.label,
      progress: clamp((current.uvIndex / 11) * 100),
      color: uv.color,
    },
    {
      icon: Cloud,
      label: 'Cloud cover',
      value: `${current.cloudCover ?? '--'}%`,
      sub: current.cloudCover > 75 ? 'Mostly covered' : current.cloudCover > 30 ? 'Partly covered' : 'Mostly clear',
      progress: current.cloudCover ?? 0,
      color: '#9db8d8',
    },
    {
      icon: CloudRain,
      label: 'Precipitation',
      value: `${current.precipitation ?? 0} mm`,
      sub: `Today: ${today?.precipitationSum ?? 0} mm total`,
      progress: clamp((current.precipitation / 10) * 100),
      color: '#7aa8ff',
    },
    {
      icon: Activity,
      label: 'Air quality',
      value: aqi ?? '--',
      sub: aqi === null ? (air.status === 'error' ? 'Unavailable' : 'Loading…') : `${airCategory.label} · US AQI`,
      progress: clamp((aqi / 300) * 100),
      color: airCategory.color,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Panel key={tile.label} padded={false} className="panel-hover p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl border"
                style={{ color: tile.color, borderColor: `${tile.color}40`, background: `${tile.color}18` }}
              >
                <Icon size={17} />
              </span>
              <span className="faint max-w-[70px] text-right text-[10px] font-semibold uppercase leading-tight tracking-wider">
                {tile.label}
              </span>
            </div>
            <p className="display-font mt-4 truncate text-xl font-bold tracking-tight sm:text-2xl">{tile.value}</p>
            <p className="muted mt-1 truncate text-[11px]">{tile.sub}</p>
            <ProgressBar value={tile.progress} color={tile.color} className="mt-3" height={4} />
          </Panel>
        )
      })}
    </div>
  )
}

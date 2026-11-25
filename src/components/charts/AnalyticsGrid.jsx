import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, CloudRain, Droplets, TrendingUp, Wind } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCompactHour, getForecastDayLabel, getUpcomingHours } from '../../utils/datetime'
import { toTemperature, toWind } from '../../utils/weather'
import { Panel, SectionHeading } from '../ui/Card'

function ChartTip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-bold" style={{ color: entry.color }}>
            {entry.value}{unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartFrame({ icon: Icon, title, description, children, badge }) {
  return (
    <Panel className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon size={16} />
            </span>
            <h3 className="display-font truncate text-sm font-bold sm:text-base">{title}</h3>
          </div>
          <p className="muted mt-2 text-[11px]">{description}</p>
        </div>
        {badge && <span className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">{badge}</span>}
      </div>
      <div className="mt-4 h-[230px] w-full min-w-0">{children}</div>
    </Panel>
  )
}

const axisProps = {
  stroke: 'var(--border)',
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--faint)', fontSize: 11 },
}

export default function AnalyticsGrid({ compact = false, only }) {
  const { weather, settings } = useApp()
  const { current, hourly, daily } = weather.data
  const unit = settings.tempUnit

  const hours = getUpcomingHours(hourly, current.time, 24)
  const tempData = hours.map((hour) => ({
    label: formatCompactHour(hour.time, settings.clock),
    temperature: toTemperature(hour.temperature, unit),
    feelsLike: toTemperature(hour.feelsLike, unit),
  }))
  const rainData = hours.map((hour) => ({
    label: formatCompactHour(hour.time, settings.clock),
    chance: hour.precipitationProbability ?? 0,
  }))
  const humidityData = hours.map((hour) => ({
    label: formatCompactHour(hour.time, settings.clock),
    humidity: hour.humidity ?? 0,
  }))
  const windData = hours.map((hour) => ({
    label: formatCompactHour(hour.time, settings.clock),
    speed: toWind(hour.windSpeed, settings.windUnit),
  }))
  const dailyData = daily.map((day, index) => ({
    label: getForecastDayLabel(day.date, index),
    high: toTemperature(day.max, unit),
    low: toTemperature(day.min, unit),
  }))

  const charts = [
    {
      key: 'temperature',
      icon: TrendingUp,
      title: 'Temperature trend',
      description: `24-hour temperature and feels-like · °${unit}`,
      badge: '24 HOURS',
      node: (
        <AreaChart data={tempData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#63d3ff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#63d3ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={26} />
          <YAxis {...axisProps} domain={[(min) => min - 2, (max) => max + 2]} tickFormatter={(value) => `${value}°`} />
          <Tooltip content={<ChartTip unit={`°${unit}`} />} />
          <Area type="monotone" dataKey="temperature" name="Actual" stroke="#63d3ff" strokeWidth={2.5} fill="url(#gradTemp)" dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="feelsLike" name="Feels like" stroke="#9b8cff" strokeWidth={1.8} strokeDasharray="5 4" fill="transparent" dot={false} />
        </AreaChart>
      ),
    },
    {
      key: 'weekly',
      icon: Activity,
      title: '7-day temperature trends',
      description: `Daily high and low · °${unit}`,
      badge: '7 DAYS',
      node: (
        <LineChart data={dailyData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} domain={[(min) => min - 2, (max) => max + 2]} tickFormatter={(value) => `${value}°`} />
          <Tooltip content={<ChartTip unit={`°${unit}`} />} />
          <Line type="monotone" dataKey="high" name="High" stroke="#ffc978" strokeWidth={2.6} dot={{ r: 3, fill: '#ffc978' }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="low" name="Low" stroke="#7aa8ff" strokeWidth={2.6} dot={{ r: 3, fill: '#7aa8ff' }} activeDot={{ r: 5 }} />
        </LineChart>
      ),
    },
    {
      key: 'rain',
      icon: CloudRain,
      title: 'Precipitation probability',
      description: 'Chance of rain or snow each hour',
      badge: '24 HOURS',
      node: (
        <BarChart data={rainData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6db9ff" />
              <stop offset="100%" stopColor="#4269c9" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={26} />
          <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip content={<ChartTip unit="%" />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="chance" name="Chance" fill="url(#gradRain)" radius={[5, 5, 0, 0]} maxBarSize={18} />
        </BarChart>
      ),
    },
    {
      key: 'humidity',
      icon: Droplets,
      title: 'Humidity',
      description: 'Relative humidity through the day',
      badge: '24 HOURS',
      node: (
        <AreaChart data={humidityData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gradHumidity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9b8cff" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#9b8cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={26} />
          <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip content={<ChartTip unit="%" />} />
          <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#b1a3ff" strokeWidth={2.4} fill="url(#gradHumidity)" dot={false} />
        </AreaChart>
      ),
    },
    {
      key: 'wind',
      icon: Wind,
      title: 'Wind speed',
      description: `Hourly wind speed · ${settings.windUnit === 'mph' ? 'mph' : 'km/h'}`,
      badge: '24 HOURS',
      node: (
        <AreaChart data={windData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gradWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade9f" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4ade9f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={26} />
          <YAxis {...axisProps} tickFormatter={(value) => `${value}`} />
          <Tooltip content={<ChartTip unit={settings.windUnit === 'mph' ? ' mph' : ' km/h'} />} />
          <Area type="monotone" dataKey="speed" name="Wind" stroke="#4ade9f" strokeWidth={2.4} fill="url(#gradWind)" dot={false} />
        </AreaChart>
      ),
    },
  ]

  const visible = only ? charts.filter((chart) => only.includes(chart.key)) : compact ? charts.slice(0, 2) : charts

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      {visible.map((chart) => (
        <ChartFrame key={chart.key} icon={chart.icon} title={chart.title} description={chart.description} badge={chart.badge}>
          <ResponsiveContainer width="100%" height="100%">{chart.node}</ResponsiveContainer>
        </ChartFrame>
      ))}
    </div>
  )
}

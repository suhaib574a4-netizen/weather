import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { aqiInfo, clamp } from '../../utils/weather'
import { Panel, ProgressBar, SectionHeading } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

const RADIUS = 76
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function PollutantCard({ name, formula, value, limit, color }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold">{name}</p>
          <p className="faint text-[10px] font-semibold uppercase tracking-wider">{formula}</p>
        </div>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      </div>
      <p className="display-font mt-4 text-xl font-bold">
        {Number.isFinite(value) ? value.toFixed(1) : '--'} <span className="text-[11px] font-medium text-[var(--muted)]">μg/m³</span>
      </p>
      {Number.isFinite(value) && (
        <ProgressBar value={clamp((value / limit) * 100)} color={color} className="mt-3" height={4} />
      )}
    </div>
  )
}

export default function AirQualityPanel({ detailed = false }) {
  const { air, location } = useApp()

  if (air.status === 'loading') {
    return (
      <Panel className="min-h-[260px]">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="flex-1 space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-16 w-full rounded-2xl" /></div>
        </div>
      </Panel>
    )
  }

  if (air.status === 'error' || !air.data) {
    return (
      <Panel className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <AlertCircle size={26} className="text-[var(--warning)]" />
        <h3 className="display-font mt-4 text-lg font-bold">Air quality is unavailable</h3>
        <p className="muted mt-2 max-w-md text-sm">{air.error ?? 'This location is not covered by the air quality model.'}</p>
        <button type="button" onClick={air.refresh} className="icon-btn mt-5" aria-label="Retry air quality request">
          <RefreshCw size={17} />
        </button>
      </Panel>
    )
  }

  const data = air.data
  const category = aqiInfo(data.aqi)
  const dash = clamp((data.aqi / 300) * CIRCUMFERENCE, 0, CIRCUMFERENCE)
  const pollutants = [
    { name: 'PM2.5', formula: 'Fine particles', value: data.pm25, limit: 75, color: category.color },
    { name: 'PM10', formula: 'Coarse particles', value: data.pm10, limit: 150, color: '#8bddff' },
    { name: 'Carbon monoxide', formula: 'CO', value: data.carbonMonoxide, limit: 4000, color: '#a9bfff' },
    { name: 'Nitrogen dioxide', formula: 'NO₂', value: data.nitrogenDioxide, limit: 200, color: '#b9a8ff' },
    { name: 'Ozone', formula: 'O₃', value: data.ozone, limit: 180, color: '#7ee0c0' },
  ]

  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeading
          eyebrow="Breathing conditions"
          title="Air quality index"
          description={`Current US AQI for ${location.name}, based on Open-Meteo's air quality model.`}
          action={
            <button type="button" onClick={air.refresh} className="icon-btn !h-9 !w-9" aria-label="Refresh air quality data">
              <RefreshCw size={16} />
            </button>
          }
        />

        <div className="mt-6 flex flex-col items-center gap-8 md:flex-row md:items-center">
          <div className="relative grid h-48 w-48 shrink-0 place-items-center">
            <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
              <circle
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke={category.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                className="transition-[stroke-dasharray] duration-700"
              />
            </svg>
            <div className="text-center">
              <p className="display-font text-5xl font-extrabold tracking-tight">{Math.round(data.aqi)}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: category.color }}>
                US AQI
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
              style={{ color: category.color, borderColor: `${category.color}55`, background: `${category.color}18` }}
            >
              {data.aqi <= 100 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {category.label}
            </span>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">{category.description}</p>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="section-kicker text-[10px]">Health recommendation</p>
              <p className="muted mt-2 text-sm leading-relaxed">{category.recommendation}</p>
            </div>
            <p className="faint mt-4 text-[11px]">
              Pollutant readings update hourly. Values are modelled estimates, not official monitoring-station measurements.
            </p>
          </div>
        </div>
      </Panel>

      <div>
        <SectionHeading eyebrow="Pollutants" title="What's in the air" className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pollutants.map((item) => (
            <PollutantCard key={item.name} {...item} />
          ))}
        </div>
      </div>

      {detailed && (
        <Panel className="!bg-[var(--surface)]">
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            The US AQI scale runs from 0 to 500. SKYCAST PRO uses the US EPA breakpoints: 0–50 good, 51–100 moderate,
            101–150 unhealthy for sensitive groups, 151–200 unhealthy, 201–300 very unhealthy, and 300+ hazardous.
            People with asthma, heart or lung conditions, children and older adults should pay particular attention to the recommendation above.
          </p>
        </Panel>
      )}
    </div>
  )
}

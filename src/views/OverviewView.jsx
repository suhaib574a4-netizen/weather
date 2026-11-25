import AnalyticsGrid from '../components/charts/AnalyticsGrid'
import CurrentHero from '../components/weather/CurrentHero'
import DailyList from '../components/weather/DailyList'
import HourlyStrip from '../components/weather/HourlyStrip'
import MetricGrid from '../components/weather/MetricGrid'
import SunArc from '../components/weather/SunArc'
import ViewHeader from '../components/ui/ViewHeader'
import WeatherGate from '../components/ui/WeatherGate'

export default function OverviewView() {
  return (
    <WeatherGate>
      <div className="fade-in space-y-6">
        <ViewHeader eyebrow="Overview" title="Weather overview" />

        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <CurrentHero />
          <SunArc />
        </div>

        <MetricGrid />

        <HourlyStrip count={24} />

        <DailyList />

        <div>
          <div className="mb-4">
            <p className="section-kicker">Data visualised</p>
            <h2 className="display-font mt-2 text-xl font-bold tracking-tight sm:text-2xl">Weather analytics</h2>
            <p className="muted mt-1.5 text-sm">Live trends update automatically whenever you change city.</p>
          </div>
          <AnalyticsGrid />
        </div>

        <p className="faint pb-2 text-center text-[11px] leading-relaxed">
          Forecast, geocoding and air quality data by Open-Meteo · Map data © OpenStreetMap contributors.
          All values are modelled estimates provided free of charge.
        </p>
      </div>
    </WeatherGate>
  )
}

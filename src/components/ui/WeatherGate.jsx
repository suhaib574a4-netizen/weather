import { useApp } from '../../context/AppContext'
import { ErrorState } from './StateMessage'
import { DashboardSkeleton } from './Skeleton'

export default function WeatherGate({ children }) {
  const { weather } = useApp()

  if (weather.status === 'error' || (!weather.data && weather.status !== 'idle')) {
    return (
      <ErrorState
        title="We couldn't load the forecast"
        message={weather.error ?? 'The weather service is unavailable right now.'}
        onRetry={weather.refresh}
        className="min-h-[420px]"
      />
    )
  }

  if (!weather.data) return <DashboardSkeleton />

  return (
    <>
      {weather.refreshError && (
        <div className="mb-5 rounded-2xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] px-4 py-3 text-sm text-[var(--warning)]" role="status">
          Auto-refresh failed: {weather.refreshError} Showing the most recent successful forecast.
        </div>
      )}
      {children}
    </>
  )
}

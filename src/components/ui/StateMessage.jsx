import { AlertTriangle, Compass, Inbox, RefreshCw } from 'lucide-react'

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={`panel panel-pad fade-in flex flex-col items-center justify-center text-center ${className}`} role="alert">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.1)] text-[var(--danger)]">
        <AlertTriangle size={24} />
      </div>
      <h2 className="display-font mt-5 text-lg font-bold">{title}</h2>
      <p className="muted mt-2 max-w-md text-sm leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-hover)]"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon = Compass, title, description, action }) {
  return (
    <div className="panel panel-pad fade-in flex min-h-[280px] flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
        {Icon ? <Icon size={24} /> : <Inbox size={24} />}
      </div>
      <h2 className="display-font mt-5 text-lg font-bold">{title}</h2>
      {description && <p className="muted mt-2 max-w-md text-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

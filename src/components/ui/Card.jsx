export function Panel({ children, className = '', padded = true, as: Tag = 'section', ...rest }) {
  return (
    <Tag className={`panel ${padded ? 'panel-pad' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionHeading({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <p className="section-kicker mb-2">{eyebrow}</p>}
        <h2 className="display-font text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="muted mt-1.5 max-w-2xl text-sm leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  )
}

const TONES = {
  neutral: 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]',
  accent: 'border-[rgba(99,211,255,0.35)] bg-[var(--accent-soft)] text-[var(--accent)]',
  success: 'border-[rgba(74,222,159,0.3)] bg-[rgba(74,222,159,0.1)] text-[var(--success)]',
  warning: 'border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.1)] text-[var(--warning)]',
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function SegmentedControl({ value, options, onChange, label, size = 'md' }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-active={value === option.value}
          aria-pressed={value === option.value}
          title={option.title}
          onClick={() => onChange(option.value)}
          className={size === 'sm' ? '!min-w-11 !px-2.5 !py-1.5 !text-xs' : ''}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value = 0, color = 'var(--accent)', height = 6, className = '' }) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[var(--surface-2)] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, white))`,
        }}
      />
    </div>
  )
}

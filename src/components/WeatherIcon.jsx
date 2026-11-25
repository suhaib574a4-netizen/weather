function Sun() {
  return (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </>
  )
}

function Moon() {
  return <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5 8.6 8.6 0 1 0 20.5 14.3Z" />
}

function Cloud() {
  return <path d="M7 18.5h10a4 4 0 0 0 .3-8A5.5 5.5 0 0 0 6.9 11.9 3.4 3.4 0 0 0 7 18.5Z" />
}

function RainLines() {
  return <path d="M8.5 20.5 7.5 22.5M12.5 20.5 11.5 22.5M16.5 20.5 15.5 22.5" />
}

function SnowDots() {
  return (
    <>
      <circle cx="8.5" cy="21" r="0.8" />
      <circle cx="12.5" cy="22" r="0.8" />
      <circle cx="16.5" cy="21" r="0.8" />
    </>
  )
}

function FogLines() {
  return <path d="M4 20.5h11M7 22.5h12" />
}

function Lightning() {
  return <path d="M13 17.5 10.5 21H13l-1.5 2.5" />
}

function iconContent(name) {
  switch (name) {
    case 'clear-day':
      return <Sun />
    case 'clear-night':
      return <Moon />
    case 'partly-day':
      return (
        <>
          <g transform="translate(-4 -4) scale(0.62)">
            <Sun />
          </g>
          <Cloud />
        </>
      )
    case 'partly-night':
      return (
        <>
          <g transform="translate(-4 -4) scale(0.62)">
            <Moon />
          </g>
          <Cloud />
        </>
      )
    case 'fog':
      return (
        <>
          <Cloud />
          <FogLines />
        </>
      )
    case 'drizzle':
    case 'rain':
      return (
        <>
          <Cloud />
          <RainLines />
        </>
      )
    case 'snow':
      return (
        <>
          <Cloud />
          <SnowDots />
        </>
      )
    case 'thunderstorm':
      return (
        <>
          <Cloud />
          <Lightning />
        </>
      )
    default:
      return <Cloud />
  }
}

export default function WeatherIcon({ name = 'cloudy', className = '' }) {
  const classes = ['weather-icon', className].filter(Boolean).join(' ')

  return (
    <svg
      className={classes}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconContent(name)}
    </svg>
  )
}

import { getWeatherInfo, sceneForWeather } from '../../utils/weather'

export default function WeatherScene({ weatherCode, isDay = true }) {
  const scene = sceneForWeather(getWeatherInfo(weatherCode, isDay), isDay)
  const night = scene === 'night'

  return (
    <div className={`weather-scene scene-${scene}`} aria-hidden="true">
      <div className="scene-glow" />
      {scene === 'sunny' && <div className="sun-rays" />}
      {night && (
        <>
          <div className="stars" />
          <div className="stars" style={{ transform: 'translateX(12%)' }} />
        </>
      )}
      {(scene === 'cloudy' || scene === 'rain' || scene === 'snow') && (
        <>
          <div className="cloud cloud-a" />
          <div className="cloud cloud-b" />
          <div className="cloud cloud-c" />
        </>
      )}
      {scene === 'rain' && <div className="rain-layer" />}
      {scene === 'snow' && <div className="snow-layer" />}
      <div className="scene-vignette" />
    </div>
  )
}

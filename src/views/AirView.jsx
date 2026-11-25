import AirQualityPanel from '../components/air/AirQualityPanel'
import ViewHeader from '../components/ui/ViewHeader'

export default function AirView() {
  return (
    <div className="fade-in space-y-6">
      <ViewHeader
        eyebrow="Atmosphere"
        title="Air quality"
        description="Modelled air pollution levels and practical health guidance for your selected city."
      />
      <AirQualityPanel detailed />
    </div>
  )
}

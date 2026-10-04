import { useAssetStore } from '../assets/assetStore'
import './LoadingScreen.css'

// Covers the page while the game's code and models download, with a bar
// showing real progress. Gone once everything has loaded. The Skip control
// stays above it, so the Plain Resume is always one click away.
export function LoadingScreen() {
  const status = useAssetStore((state) => state.status)
  const percent = useAssetStore((state) => Math.round(state.progress * 100))
  if (status === 'ready') return null

  return (
    <div className="loading-screen">
      {status === 'failed' ? (
        <p className="loading-screen__error" role="alert">
          The game could not load. Use Skip to resume to read the resume instead.
        </p>
      ) : (
        <>
          <p className="loading-screen__label" id="loading-screen-label">
            Loading the game
          </p>
          <div
            className="loading-screen__bar"
            role="progressbar"
            aria-labelledby="loading-screen-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            {/* scaleX, not width: a transform animates without relayout. */}
            <div className="loading-screen__fill" style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
          <p className="loading-screen__percent" aria-hidden="true">
            {percent}%
          </p>
        </>
      )}
    </div>
  )
}

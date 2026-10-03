import { resumeData } from '../resume/resumeData'
import { selectLevel, useRunStore } from '../run/runStore'
import './Hud.css'

// The Hero's name and Level, top left. It subscribes to the Level alone, so
// it re-renders only on a Level change; the canvas (a sibling in App) never
// re-renders because of it.
export function Hud() {
  const level = useRunStore(selectLevel)

  return (
    <header className="hud">
      <p className="hud__name">{resumeData.hero.name}</p>
      {/* A polite live region, so screen readers announce a Level up. Keyed
          by Level so each Level up remounts the text and replays its pop. */}
      <p className="hud__level" aria-live="polite">
        <span key={level} className="hud__level-text">
          Level {level}
        </span>
      </p>
    </header>
  )
}

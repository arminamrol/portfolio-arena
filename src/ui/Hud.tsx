import { resumeData } from '../resume/resumeData'
import { runStore, selectLevel, useRunStore } from '../run/runStore'
import './Hud.css'
import { SHOP_BUTTON_ID, SHOP_PANEL_ID } from './ShopPanel'

// The Hero's name and Level, and the Shop button, top left. It subscribes to
// the Level and whether the Shop is open, so it re-renders only when one of
// those changes; the canvas (a sibling in App) never re-renders because of it.
export function Hud() {
  const level = useRunStore(selectLevel)
  const shopOpen = useRunStore((state) => state.shopOpen)

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
      {/* Toggles the Shop from anywhere on the map, not only at the Shop. */}
      <button
        type="button"
        id={SHOP_BUTTON_ID}
        className="hud__shop-button"
        aria-expanded={shopOpen}
        aria-controls={SHOP_PANEL_ID}
        onClick={() => runStore.getState().toggleShop()}
      >
        Shop
      </button>
    </header>
  )
}

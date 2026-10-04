import { Scene } from './scene/Scene'
import { AbilityBar } from './ui/AbilityBar'
import { Hud } from './ui/Hud'
import { InfoPanel } from './ui/InfoPanel'
import { Minimap } from './ui/Minimap'
import { NexusNotice } from './ui/NexusNotice'
import { ShopPanel } from './ui/ShopPanel'
import { SkipControl } from './ui/SkipControl'

type GameProps = {
  onSkip: () => void
  takeFocus?: boolean
}

// The game: the canvas and the DOM overlay on top of it. The App shell loads
// this module lazily, so three, React Three Fiber and everything that reads
// from them land in their own chunk that the Plain Resume never downloads.
export function Game({ onSkip, takeFocus }: GameProps) {
  return (
    <main className="game" aria-label="Game">
      <SkipControl onSkip={onSkip} takeFocus={takeFocus} />
      <Scene />
      <Hud />
      <InfoPanel />
      <ShopPanel />
      <AbilityBar />
      <Minimap />
      <NexusNotice />
    </main>
  )
}

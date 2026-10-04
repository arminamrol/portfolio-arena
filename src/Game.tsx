import { useEffect } from 'react'
import { useAssetStore } from './assets/assetStore'
import { loadModels } from './assets/loadModels'
import { Scene } from './scene/Scene'
import { AbilityBar } from './ui/AbilityBar'
import { Hud } from './ui/Hud'
import { InfoPanel } from './ui/InfoPanel'
import { LoadingScreen } from './ui/LoadingScreen'
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
  const ready = useAssetStore((state) => state.status === 'ready')

  useEffect(() => {
    // Failure is reported through the asset store, which the loading screen
    // shows; nothing else to do with the rejection here.
    loadModels().catch(() => {})
  }, [])

  return (
    <main className="game" aria-label="Game">
      <SkipControl onSkip={onSkip} takeFocus={takeFocus} />
      {/* The world is built from the models, so nothing mounts until
          they are all in. */}
      {ready && (
        <>
          <Scene />
          <Hud />
          <InfoPanel />
          <ShopPanel />
          <AbilityBar />
          <Minimap />
          <NexusNotice />
        </>
      )}
      <LoadingScreen />
    </main>
  )
}

import { Scene } from './scene/Scene'
import { AbilityBar } from './ui/AbilityBar'
import { Hud } from './ui/Hud'
import { InfoPanel } from './ui/InfoPanel'
import { Minimap } from './ui/Minimap'

export function App() {
  return (
    <>
      <Scene />
      <Hud />
      <InfoPanel />
      <AbilityBar />
      <Minimap />
    </>
  )
}

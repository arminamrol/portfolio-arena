import { lazy, Suspense, useState } from 'react'
import { PlainResume } from './plain/PlainResume'
import { LoadingScreen } from './ui/LoadingScreen'
import { SkipControl } from './ui/SkipControl'

// Code-split: the game module (and with it three and React Three Fiber) is
// fetched only the first time the game is shown.
const Game = lazy(() => import('./Game').then((module) => ({ default: module.Game })))

type View = 'game' | 'plain'

type AppProps = {
  webglAvailable: boolean
}

// The App shell: the game or the Plain Resume. Without WebGL the game cannot
// run, so the visitor gets the Plain Resume and is never offered the game.
export function App({ webglAvailable }: AppProps) {
  const [view, setView] = useState<View>(webglAvailable ? 'game' : 'plain')
  // False on first load; once the visitor switches, the view they land on
  // takes focus so a keyboard user is not dropped on <body>.
  const [switched, setSwitched] = useState(false)

  function switchTo(next: View) {
    setView(next)
    setSwitched(true)
  }

  if (view === 'plain') {
    return <PlainResume onPlay={webglAvailable ? () => switchTo('game') : undefined} takeFocus={switched} />
  }

  return (
    // While the game's code downloads, the loading screen (and the Skip
    // control, which is always visible) show already, and stay on screen
    // without a flicker until the models are in too.
    <Suspense
      fallback={
        <>
          <SkipControl onSkip={() => switchTo('plain')} takeFocus={switched} />
          <LoadingScreen />
        </>
      }
    >
      <Game onSkip={() => switchTo('plain')} takeFocus={switched} />
    </Suspense>
  )
}

import { useFrame } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { runStore } from '../run/runStore'
import { AbilityEffectPlayer } from './abilityEffectPlayer'

// Plays an Ability's effect around the Hero each time one is cast.
export function AbilityEffects() {
  // One player for the life of the scene. Its effects are created and
  // disposed imperatively, outside JSX, because they come and go faster
  // than React should be re-rendering.
  const [player] = useState(() => new AbilityEffectPlayer())

  // A plain store subscription, not a selector hook: a cast should start an
  // effect, not re-render this component.
  useEffect(() => {
    const unsubscribe = runStore.subscribe((state, previous) => {
      if (state.abilityCast && state.abilityCast !== previous.abilityCast) player.play(state.abilityCast.key)
    })
    return () => {
      unsubscribe()
      // R3F disposes what JSX created when it unmounts, but these effects
      // were made by hand, so free them by hand.
      player.clear()
    }
  }, [player])

  useFrame((_, delta) => {
    // The root follows the Hero, so an effect cast mid-walk stays around it.
    const { heroPosition } = runStore.getState()
    player.root.position.set(heroPosition.x, 0, heroPosition.z)
    player.update(delta)
  })

  // <primitive> mounts an existing Object3D instead of creating one.
  return <primitive object={player.root} />
}

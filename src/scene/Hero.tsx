import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { AnimationClip, AnimationMixer, MathUtils, type AnimationAction, type Group } from 'three'
import { fitToSize, getModel } from '../assets/loadModels'
import { HERO_SPEED, stepToward } from '../run/movement'
import { runStore, selectHeroAnimation, type HeroAnimation } from '../run/runStore'

// How quickly the Hero turns to face its target (higher = snappier).
const TURN_SHARPNESS = 12
// World units from the Hero's feet to the top of its head.
const HERO_HEIGHT = 1.6
// Seconds to blend from one animation into the next.
const CROSSFADE = 0.2

export function Hero() {
  const ref = useRef<Group>(null)
  const start = runStore.getState().heroPosition
  // The yaw the Hero is turning toward. Kept outside the store so the turn
  // can finish after the Hero arrives and the move target is cleared.
  const facing = useRef(0)
  const [{ model, mixer, actions }] = useState(createHeroRig)

  // Switch clips only when walking starts or stops: a plain subscription,
  // so the switch never re-renders React.
  useEffect(() => {
    let current = selectHeroAnimation(runStore.getState())
    actions[current].reset().play()
    const unsubscribe = runStore.subscribe((state) => {
      const next = selectHeroAnimation(state)
      if (next === current) return
      // crossFadeTo ramps the old action's weight down and the new one's up
      // over the same time, so the pose blends instead of snapping.
      actions[next].reset().play()
      actions[current].crossFadeTo(actions[next], CROSSFADE, false)
      current = next
    })
    return () => {
      unsubscribe()
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  // useFrame runs inside R3F's render loop, once per frame before rendering.
  // `delta` is the seconds since the last frame (~0.016 at 60 fps, ~0.007 at
  // 144 fps). Multiplying speeds by delta makes motion depend on elapsed time,
  // not on how many frames the machine manages to draw.
  //
  // We read the store with getState() and mutate the Object3D directly:
  // no setState, so React does not re-render 60 times a second.
  useFrame((_, delta) => {
    const hero = ref.current
    if (!hero) return
    const { heroPosition, moveTarget, heroMovedTo } = runStore.getState()

    if (moveTarget) {
      // Yaw that points the Hero's +Z face at the target. atan2(x, z) (not the
      // usual atan2(y, x)) because a rotation of 0 around Y faces +Z.
      const dx = moveTarget.x - heroPosition.x
      const dz = moveTarget.z - heroPosition.z
      if (dx !== 0 || dz !== 0) facing.current = Math.atan2(dx, dz)

      const next = stepToward(heroPosition, moveTarget, HERO_SPEED * delta)
      heroMovedTo(next)
      hero.position.set(next.x, 0, next.z)
    }

    hero.rotation.y = turnToward(hero.rotation.y, facing.current, TURN_SHARPNESS, delta)
    // Advances every playing action by delta seconds and writes the bones'
    // new poses. Like movement, time-based, so the walk cycle plays at the
    // same speed at any frame rate.
    mixer.update(delta)
  })

  return (
    // A Group is an empty Object3D: no geometry, just a transform. Moving and
    // rotating the group carries its children along (the scene graph), so the
    // model never needs its own movement code.
    <group ref={ref} position={[start.x, 0, start.z]}>
      <primitive object={model} />
    </group>
  )
}

// The Hero's model, and the mixer that animates it. The model is used as
// loaded, not cloned: there is only one Hero, and a clone of a skinned mesh
// would still be bound to the original's skeleton.
function createHeroRig() {
  const gltf = getModel('hero')
  const model = gltf.scene
  fitToSize(model, { height: HERO_HEIGHT })

  // An AnimationClip is keyframe data: for each bone, a track of times and
  // values (positions, rotations). It does nothing by itself. An
  // AnimationMixer plays clips on one object tree: clipAction(clip) gives
  // an AnimationAction, the playback state of one clip (playing, time,
  // weight, loop mode), and every mixer.update(delta) moves the actions on
  // and blends their poses into the bones, weighted.
  const mixer = new AnimationMixer(model)
  const action = (name: HeroAnimation): AnimationAction => {
    const clip = AnimationClip.findByName(gltf.animations, name)
    const found = clip && mixer.clipAction(clip)
    if (!found) throw new Error(`The Hero model has no "${name}" animation`)
    return found
  }
  const actions: Record<HeroAnimation, AnimationAction> = { idle: action('idle'), walk: action('walk') }
  return { model, mixer, actions }
}

// Eases an angle toward a target along the shorter way round. Without the
// wrap, turning from 170° to -170° would spin 340° instead of 20°.
function turnToward(current: number, target: number, sharpness: number, delta: number) {
  const diff = MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI
  // damp() is frame-rate-independent lerp: it closes the same fraction of the
  // gap per second no matter how the second is sliced into frames.
  return MathUtils.damp(current, current + diff, sharpness, delta)
}

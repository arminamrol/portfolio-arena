import {
  AdditiveBlending,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  RingGeometry,
  TorusGeometry,
  type ColorRepresentation,
  type Object3D,
} from 'three'
import type { AbilityKey } from '../resume/types'

// The most effects alive at once. Spamming past it drops the oldest early,
// so holding down every key can never pile up draw calls.
export const MAX_ACTIVE_EFFECTS = 8

// Geometry is shared by every cast and never disposed: its vertex buffers
// are uploaded to the GPU once and reused for the life of the page. Only
// the per-cast materials below are created and disposed with each effect.
const orbitGeometry = new TorusGeometry(1, 0.04, 6, 48)
const pulseGeometry = new RingGeometry(0.85, 1, 48)
// Open-ended, and shifted up by half its height so its origin sits at its
// base: scaling Y then grows it upward from the ground, not both ways.
const beaconGeometry = new CylinderGeometry(0.8, 0.8, 1, 24, 1, true).translate(0, 0.5, 0)
const beaconBaseGeometry = new CircleGeometry(1, 32)
const shardGeometry = new OctahedronGeometry(0.18)

// One playing effect. `update` maps the effect's progress t (0 at the cast,
// 1 at the end) onto its objects; it never needs delta, because the player
// turns elapsed time into t.
type Effect = {
  object: Object3D
  materials: MeshBasicMaterial[]
  duration: number
  update: (t: number) => void
}

type ActiveEffect = Effect & { elapsed: number }

// Plays the Ability effects around one point. Plain Three.js, no React: the
// scene component adds `root` to the scene, moves it with the Hero and calls
// `update` every frame.
export class AbilityEffectPlayer {
  readonly root = new Group()
  private active: ActiveEffect[] = []

  play(key: AbilityKey) {
    if (this.active.length >= MAX_ACTIVE_EFFECTS) this.finish(this.active[0])
    const effect: ActiveEffect = { ...effects[key](), elapsed: 0 }
    effect.update(0)
    this.root.add(effect.object)
    this.active.push(effect)
  }

  update(delta: number) {
    for (const effect of [...this.active]) {
      effect.elapsed += delta
      const t = Math.min(1, effect.elapsed / effect.duration)
      effect.update(t)
      if (t >= 1) this.finish(effect)
    }
  }

  clear() {
    for (const effect of [...this.active]) this.finish(effect)
  }

  // Removing an object from the scene only drops the scene graph's reference
  // to it. The material's GPU-side state stays until dispose() tells the
  // renderer to free it; skip that and every cast leaks a little.
  private finish(effect: ActiveEffect) {
    this.root.remove(effect.object)
    for (const material of effect.materials) material.dispose()
    this.active = this.active.filter((other) => other !== effect)
  }
}

// A glowing, see-through material. A new one per cast (each effect fades on
// its own), but cheap: Three.js caches compiled shader programs by their
// settings, so every glow material reuses the same program.
//
// AdditiveBlending adds this colour on top of whatever is already drawn
// instead of covering it: overlaps get brighter and black adds nothing, so
// plain shapes read as light. depthWrite off stops one glowing surface from
// hiding another behind it.
function glowMaterial(color: ColorRepresentation) {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  })
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

// One effect per Ability key. All original shapes built from primitives.
const effects: Record<AbilityKey, () => Effect> = {
  // Q: three tilted orbits around the Hero's chest that spin, widen and fade.
  Q: () => {
    const material = glowMaterial('#5fd4f4')
    const object = new Group()
    object.position.y = 0.9
    for (let i = 0; i < 3; i++) {
      const orbit = new Mesh(orbitGeometry, material)
      // Each orbit is tipped 70° off flat, then turned a third of a circle
      // further than the last, like electron paths in an atom diagram.
      orbit.rotation.set(Math.PI / 2 - 0.35, 0, 0)
      const pivot = new Group()
      pivot.rotation.y = (i * Math.PI * 2) / 3
      pivot.add(orbit)
      object.add(pivot)
    }
    return {
      object,
      materials: [material],
      duration: 0.9,
      update: (t) => {
        object.rotation.y = t * Math.PI * 2
        object.scale.setScalar(0.3 + easeOutCubic(t) * 1.2)
        material.opacity = 1 - t * t
      },
    }
  },

  // W: three rings ripple out across the ground, one after another.
  W: () => {
    const RIPPLES = 3
    const STAGGER = 0.25
    const materials = Array.from({ length: RIPPLES }, () => glowMaterial('#4f7dff'))
    const object = new Group()
    const rings = materials.map((material) => {
      const ring = new Mesh(pulseGeometry, material)
      // Flat on the ground, just above the Lanes (see MoveTargetMarker).
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.06
      object.add(ring)
      return ring
    })
    return {
      object,
      materials,
      duration: 1.1,
      update: (t) => {
        rings.forEach((ring, i) => {
          // Each ripple runs its own 0..1 over the part of the effect left
          // after its delay, so all three end together.
          const local = Math.min(1, Math.max(0, (t - i * STAGGER) / (1 - i * STAGGER)))
          ring.visible = local > 0
          ring.scale.setScalar(0.3 + easeOutCubic(local) * 3)
          materials[i].opacity = 1 - local
        })
      },
    }
  },

  // E: a column of light rises from a glowing disc under the Hero.
  E: () => {
    const material = glowMaterial('#6fe0a2')
    const object = new Group()
    const column = new Mesh(beaconGeometry, material)
    const base = new Mesh(beaconBaseGeometry, material)
    base.rotation.x = -Math.PI / 2
    base.position.y = 0.06
    object.add(column, base)
    return {
      object,
      materials: [material],
      duration: 1.2,
      update: (t) => {
        const eased = easeOutCubic(t)
        // Shoots up fast while narrowing, so it reads as a beam leaving.
        column.scale.set(1 - eased * 0.6, 0.1 + eased * 5, 1 - eased * 0.6)
        base.scale.setScalar(0.6 + eased * 0.6)
        // sin over 0..π: fades in, then out, ending fully transparent.
        material.opacity = Math.sin(t * Math.PI) * 0.8
      },
    }
  },

  // R: shards burst out of the Hero, arc up, fall and wink out.
  R: () => {
    const SHARDS = 10
    const GRAVITY = -9
    const material = glowMaterial('#ff9a3c')
    const object = new Group()
    object.position.y = 0.9
    const shards = Array.from({ length: SHARDS }, (_, i) => {
      const shard = new Mesh(shardGeometry, material)
      const angle = (i / SHARDS) * Math.PI * 2
      // Fixed (not random) speeds, so every cast looks the same; odd shards
      // fly lower and further than even ones.
      const speed = i % 2 ? 4 : 3
      const lift = i % 2 ? 3 : 4.5
      object.add(shard)
      return { shard, vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed, vy: lift }
    })
    const duration = 0.9
    return {
      object,
      materials: [material],
      duration,
      update: (t) => {
        // Plain projectile motion in seconds: position = v·s + ½·g·s².
        const s = t * duration
        for (const { shard, vx, vy, vz } of shards) {
          shard.position.set(vx * s, vy * s + 0.5 * GRAVITY * s * s, vz * s)
          shard.rotation.set(s * 9, s * 6, 0)
        }
        material.opacity = 1 - t ** 3
      },
    }
  },
}

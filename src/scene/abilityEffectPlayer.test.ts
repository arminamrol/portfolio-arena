import { Matrix4, Mesh, type BufferGeometry, type Material, type Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { ABILITY_KEYS as KEYS } from '../resume/types'
import { AbilityEffectPlayer, MAX_ACTIVE_EFFECTS, MAX_ACTIVE_SIMPLE_EFFECTS } from './abilityEffectPlayer'

// Longer than any effect lasts.
const LONG_AFTER = 10

describe('Ability effect player', () => {
  it.each(KEYS)('plays the %s effect under its root, then removes it', (key) => {
    const player = new AbilityEffectPlayer()

    player.play(key)
    expect(meshesUnder(player.root).length).toBeGreaterThan(0)

    player.update(LONG_AFTER)
    expect(player.root.children).toHaveLength(0)
  })

  it.each(KEYS)('disposes every material the %s effect used once it ends', (key) => {
    const player = new AbilityEffectPlayer()
    player.play(key)
    const materials = materialsUnder(player.root)
    const disposed = watchDisposal(materials)

    player.update(LONG_AFTER)

    expect(materials.length).toBeGreaterThan(0)
    expect(disposed.size).toBe(materials.length)
  })

  it.each(KEYS)('keeps the %s effect geometry alive for the next cast', (key) => {
    const player = new AbilityEffectPlayer()
    player.play(key)
    const disposed = watchDisposal(geometriesUnder(player.root))

    player.update(LONG_AFTER)

    expect(disposed.size).toBe(0)
  })

  it('keeps an effect alive partway through', () => {
    const player = new AbilityEffectPlayer()

    player.play('Q')
    player.update(0.1)

    expect(player.root.children).toHaveLength(1)
  })

  it('caps how many effects play at once when Abilities are spammed, disposing the ones it drops', () => {
    const player = new AbilityEffectPlayer()
    player.play('R')
    const firstMaterials = materialsUnder(player.root)
    const disposed = watchDisposal(firstMaterials)

    for (let i = 0; i < MAX_ACTIVE_EFFECTS * 3; i++) {
      player.play(KEYS[i % KEYS.length])
      player.update(0.01)
    }

    expect(player.root.children).toHaveLength(MAX_ACTIVE_EFFECTS)
    expect(disposed.size).toBe(firstMaterials.length)
  })

  it('clear removes and disposes everything still playing', () => {
    const player = new AbilityEffectPlayer()
    KEYS.forEach((key) => player.play(key))
    const materials = materialsUnder(player.root)
    const disposed = watchDisposal(materials)

    player.clear()

    expect(player.root.children).toHaveLength(0)
    expect(disposed.size).toBe(materials.length)
  })
})

describe('Ability effect player on a small screen', () => {
  it.each(KEYS)('draws the %s effect with fewer parts', (key) => {
    const full = new AbilityEffectPlayer()
    const simple = new AbilityEffectPlayer({ detail: 'simple', calm: false })

    full.play(key)
    simple.play(key)

    expect(meshesUnder(simple.root).length).toBeGreaterThan(0)
    expect(meshesUnder(simple.root).length).toBeLessThan(meshesUnder(full.root).length)
  })

  it('caps how many effects play at once lower', () => {
    const player = new AbilityEffectPlayer({ detail: 'simple', calm: false })

    for (let i = 0; i < MAX_ACTIVE_EFFECTS; i++) player.play(KEYS[i % KEYS.length])

    expect(MAX_ACTIVE_SIMPLE_EFFECTS).toBeLessThan(MAX_ACTIVE_EFFECTS)
    expect(player.root.children).toHaveLength(MAX_ACTIVE_SIMPLE_EFFECTS)
  })

  it('switches to fewer parts for the next cast when the screen changes', () => {
    const player = new AbilityEffectPlayer()
    player.play('R')
    const fullParts = meshesUnder(player.root).length
    player.clear()

    player.style = { detail: 'simple', calm: false }
    player.play('R')

    expect(meshesUnder(player.root).length).toBeLessThan(fullParts)
  })
})

describe('Ability effect player under reduced motion', () => {
  const calm = { detail: 'full', calm: true } as const

  it.each(KEYS)('plays the %s effect without moving, spinning or growing anything', (key) => {
    const player = new AbilityEffectPlayer(calm)
    player.play(key)
    player.update(0.05)
    const early = worldMatrices(player.root)

    player.update(0.3)

    const later = worldMatrices(player.root)
    expect(later.length).toBeGreaterThan(0)
    later.forEach((matrix, i) => expect(matrix.equals(early[i])).toBe(true))
  })

  it.each(KEYS)('still shows the %s cast, fading in and out', (key) => {
    const player = new AbilityEffectPlayer(calm)
    player.play(key)
    const [material] = materialsUnder(player.root) as { opacity: number }[]

    player.update(0.3)
    expect(material.opacity).toBeGreaterThan(0)

    player.update(LONG_AFTER)
    expect(player.root.children).toHaveLength(0)
  })
})

function meshesUnder(root: Object3D) {
  const meshes: Mesh[] = []
  root.traverse((object) => {
    if (object instanceof Mesh) meshes.push(object)
  })
  return meshes
}

function materialsUnder(root: Object3D) {
  return [...new Set(meshesUnder(root).flatMap((mesh) => mesh.material as Material | Material[]))]
}

function geometriesUnder(root: Object3D) {
  return [...new Set(meshesUnder(root).map((mesh) => mesh.geometry))]
}

// dispose() fires a 'dispose' event; the renderer listens for it to free
// GPU memory, and so can a test.
function watchDisposal(resources: (Material | BufferGeometry)[]) {
  const disposed = new Set<Material | BufferGeometry>()
  for (const resource of resources) resource.addEventListener('dispose', () => disposed.add(resource))
  return disposed
}

function worldMatrices(root: Object3D) {
  root.updateMatrixWorld(true)
  return meshesUnder(root).map((mesh) => new Matrix4().copy(mesh.matrixWorld))
}

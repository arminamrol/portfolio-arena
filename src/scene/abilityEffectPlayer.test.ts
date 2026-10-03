import { Mesh, type BufferGeometry, type Material, type Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { ABILITY_KEYS as KEYS } from '../resume/types'
import { AbilityEffectPlayer, MAX_ACTIVE_EFFECTS } from './abilityEffectPlayer'

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

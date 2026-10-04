import { describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { MAX_LEVEL, XP_PER_CAPTURE } from './level'
import { FOG_REVEAL_RADIUS, isRevealed } from './fog'
import {
  CAPTURES_FOR_VICTORY,
  createRunStore,
  NEXUS_RANGE,
  selectCapturesRemaining,
  selectLevel,
  SHOP_RANGE,
  TOWER_RANGE,
} from './runStore'

describe('Run store', () => {
  it('starts the Hero at the Base with no move target', () => {
    const run = createRunStore()

    expect(run.getState().heroPosition).toEqual(mapLayout(resumeData).base)
    expect(run.getState().moveTarget).toBeNull()
  })

  it('moving the Hero updates its position', () => {
    const run = createRunStore()

    run.getState().heroMovedTo({ x: 3, z: -2 })

    expect(run.getState().heroPosition).toEqual({ x: 3, z: -2 })
  })

  it('setting a move target exposes it for movement and the marker', () => {
    const run = createRunStore()

    run.getState().setMoveTarget({ x: 5, z: 7 })

    expect(run.getState().moveTarget).toEqual({ x: 5, z: 7 })
  })

  it('keeps the move target while the Hero is still on its way', () => {
    const run = createRunStore()
    run.getState().setMoveTarget({ x: 5, z: 0 })

    run.getState().heroMovedTo({ x: 2, z: 0 })

    expect(run.getState().moveTarget).toEqual({ x: 5, z: 0 })
  })

  it('clears the move target once the Hero arrives', () => {
    const run = createRunStore()
    run.getState().setMoveTarget({ x: 5, z: 0 })

    run.getState().heroMovedTo({ x: 5, z: 0 })

    expect(run.getState().moveTarget).toBeNull()
  })

  describe('Capture and Info Panel', () => {
    it('Captures a Tower and opens its Info Panel when the Hero enters its range', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')

      run.getState().heroMovedTo(tower.position)

      expect(run.getState().captures).toEqual(new Set(['tiny-charts']))
      expect(run.getState().openInfoPanel).toBe('tiny-charts')
    })

    it('closes the Info Panel when the Hero walks out of range', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')
      run.getState().heroMovedTo(tower.position)

      run.getState().heroMovedTo({ x: tower.position.x + 5, z: tower.position.z })

      expect(run.getState().openInfoPanel).toBeNull()
      expect(run.getState().captures).toEqual(new Set(['tiny-charts']))
    })

    it('keeps the Info Panel closed after closing it while the Hero is still in range', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')
      run.getState().heroMovedTo(tower.position)

      run.getState().closeInfoPanel()
      run.getState().heroMovedTo({ x: tower.position.x + 0.5, z: tower.position.z })

      expect(run.getState().openInfoPanel).toBeNull()
    })

    it('reopens a Captured Tower\'s Info Panel on re-entry without Capturing it again', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')
      run.getState().heroMovedTo(tower.position)
      run.getState().heroMovedTo({ x: tower.position.x + 5, z: tower.position.z })
      const capturesBefore = run.getState().captures

      run.getState().heroMovedTo(tower.position)

      expect(run.getState().openInfoPanel).toBe('tiny-charts')
      // The same set, untouched: no second Capture happened.
      expect(run.getState().captures).toBe(capturesBefore)
    })

    it('walking to each Tower\'s position Captures that Tower and only that one', () => {
      const towers = allTowers()
      expect(towers).toHaveLength(7)

      for (const tower of towers) {
        const run = createRunStore()

        run.getState().heroMovedTo(tower.position)

        expect(run.getState().captures).toEqual(new Set([tower.entryId]))
        expect(run.getState().openInfoPanel).toBe(tower.entryId)
      }
    })

    it('Captures nothing at the Base', () => {
      const run = createRunStore()

      run.getState().heroMovedTo(mapLayout(resumeData).base)

      expect(run.getState().captures.size).toBe(0)
      expect(run.getState().openInfoPanel).toBeNull()
    })
  })

  describe('XP and Level', () => {
    it('starts the Run at Level 1 with no XP', () => {
      const run = createRunStore()

      expect(run.getState().xp).toBe(0)
      expect(selectLevel(run.getState())).toBe(1)
    })

    it('grants XP_PER_CAPTURE for a Capture', () => {
      const run = createRunStore()

      run.getState().heroMovedTo(towerByEntry('tiny-charts').position)

      expect(run.getState().xp).toBe(XP_PER_CAPTURE)
      expect(selectLevel(run.getState())).toBe(2)
    })

    it('grants no XP for re-entering a Captured Tower', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')
      run.getState().heroMovedTo(tower.position)
      run.getState().heroMovedTo({ x: tower.position.x + 5, z: tower.position.z })

      run.getState().heroMovedTo(tower.position)

      expect(run.getState().xp).toBe(XP_PER_CAPTURE)
    })

    it('grants no XP for standing in a Tower\'s range', () => {
      const run = createRunStore()
      const tower = towerByEntry('tiny-charts')
      run.getState().heroMovedTo(tower.position)

      run.getState().heroMovedTo({ x: tower.position.x + 0.5, z: tower.position.z })

      expect(run.getState().xp).toBe(XP_PER_CAPTURE)
    })

    it('raises XP and Level as Captures add up, reaching the top Level after every Tower', () => {
      const run = createRunStore()
      const towers = allTowers()
      const levels = [selectLevel(run.getState())]

      for (const tower of towers) {
        run.getState().heroMovedTo(tower.position)
        levels.push(selectLevel(run.getState()))
      }

      expect(run.getState().xp).toBe(towers.length * XP_PER_CAPTURE)
      // Never drops, and every map (at least 6 Towers) tops out.
      expect(levels).toEqual([...levels].sort((a, b) => a - b))
      expect(levels.at(-1)).toBe(MAX_LEVEL)
    })
  })

  describe('Fog', () => {
    it('starts the Run with the ground around the Base revealed and the Nexus in Fog', () => {
      const run = createRunStore()
      const { base, nexus } = mapLayout(resumeData)

      expect(isRevealed(run.getState().fog, base)).toBe(true)
      expect(isRevealed(run.getState().fog, nexus)).toBe(false)
    })

    it('reveals the ground around the Hero as it moves', () => {
      const run = createRunStore()
      const spot = { x: 0, z: 0 }
      const nearby = { x: FOG_REVEAL_RADIUS - 1, z: 0 }
      const beyond = { x: FOG_REVEAL_RADIUS + 2, z: 0 }
      expect(isRevealed(run.getState().fog, spot)).toBe(false)

      run.getState().heroMovedTo(spot)

      expect(isRevealed(run.getState().fog, spot)).toBe(true)
      expect(isRevealed(run.getState().fog, nearby)).toBe(true)
      expect(isRevealed(run.getState().fog, beyond)).toBe(false)
    })

    it('keeps revealed ground revealed after the Hero leaves', () => {
      const run = createRunStore()
      const { base, nexus } = mapLayout(resumeData)
      run.getState().heroMovedTo({ x: 0, z: 0 })

      run.getState().heroMovedTo(nexus)

      expect(isRevealed(run.getState().fog, { x: 0, z: 0 })).toBe(true)
      expect(isRevealed(run.getState().fog, base)).toBe(true)
      expect(isRevealed(run.getState().fog, nexus)).toBe(true)
    })

    it('keeps the same Fog while the Hero moves over ground it has already revealed', () => {
      const run = createRunStore()
      run.getState().heroMovedTo({ x: 0, z: 0 })
      const before = run.getState().fog

      run.getState().heroMovedTo({ x: 0, z: 0 })

      // The same array: nothing new to redraw.
      expect(run.getState().fog).toBe(before)
    })

    it('reveals every Tower by the time the Hero is in its range', () => {
      for (const tower of allTowers()) {
        const run = createRunStore()
        const edgeOfRange = { x: tower.position.x + TOWER_RANGE, z: tower.position.z }

        run.getState().heroMovedTo(edgeOfRange)

        expect(isRevealed(run.getState().fog, tower.position)).toBe(true)
      }
    })

    it('clamps positions past the edge of the map onto it', () => {
      const run = createRunStore()

      run.getState().heroMovedTo({ x: -100, z: -100 })

      expect(isRevealed(run.getState().fog, { x: -100, z: -100 })).toBe(true)
    })
  })

  describe('Abilities', () => {
    it('starts with no Ability cast', () => {
      const run = createRunStore()

      expect(run.getState().abilityCast).toBeNull()
    })

    it('casting an Ability records which key was cast', () => {
      const run = createRunStore()

      run.getState().castAbility('E')

      expect(run.getState().abilityCast?.key).toBe('E')
    })

    it('casting the same Ability twice records two distinct casts', () => {
      const run = createRunStore()

      run.getState().castAbility('Q')
      const first = run.getState().abilityCast
      run.getState().castAbility('Q')
      const second = run.getState().abilityCast

      expect(second?.key).toBe('Q')
      expect(second?.id).not.toBe(first?.id)
    })
  })

  describe('Shop', () => {
    it('starts with the Shop closed, though the Hero spawns near it', () => {
      const run = createRunStore()

      expect(run.getState().shopOpen).toBe(false)
    })

    it('opens and closes the Shop from anywhere', () => {
      const run = createRunStore()

      run.getState().openShop()
      expect(run.getState().shopOpen).toBe(true)

      run.getState().closeShop()
      expect(run.getState().shopOpen).toBe(false)
    })

    it('opens the Shop when the Hero walks up to it and closes it when the Hero walks away', () => {
      const run = createRunStore()
      const { shop, base } = mapLayout(resumeData)

      run.getState().heroMovedTo({ x: shop.x - SHOP_RANGE, z: shop.z })
      expect(run.getState().shopOpen).toBe(true)

      run.getState().heroMovedTo(base)
      expect(run.getState().shopOpen).toBe(false)
    })

    it('lets the Shop be closed while the Hero still stands at it', () => {
      const run = createRunStore()
      const { shop } = mapLayout(resumeData)
      run.getState().heroMovedTo(shop)

      run.getState().closeShop()
      run.getState().heroMovedTo({ x: shop.x + 0.1, z: shop.z })

      expect(run.getState().shopOpen).toBe(false)
    })

    it('toggles the Shop', () => {
      const run = createRunStore()

      run.getState().toggleShop()
      expect(run.getState().shopOpen).toBe(true)

      run.getState().toggleShop()
      expect(run.getState().shopOpen).toBe(false)
    })

    it('keeps a Shop opened from afar open while the Hero walks elsewhere', () => {
      const run = createRunStore()
      run.getState().openShop()

      run.getState().heroMovedTo({ x: 0, z: 0 })

      expect(run.getState().shopOpen).toBe(true)
    })
  })

  describe('Nexus and Victory', () => {
    const { nexus, base } = mapLayout(resumeData)

    it('needs 3 Captures for Victory', () => {
      expect(CAPTURES_FOR_VICTORY).toBe(3)
    })

    it('shows how many Captures remain when the Hero reaches the Nexus with none', () => {
      const run = createRunStore()

      run.getState().heroMovedTo(nexus)

      expect(run.getState().nexusNotice).toBe('capturesRemaining')
      expect(selectCapturesRemaining(run.getState())).toBe(3)
    })

    it('counts the Captures already made', () => {
      const run = createRunStore()
      captureTowers(run, 2)

      run.getState().heroMovedTo({ x: nexus.x + NEXUS_RANGE, z: nexus.z })

      expect(run.getState().nexusNotice).toBe('capturesRemaining')
      expect(selectCapturesRemaining(run.getState())).toBe(1)
    })

    it('hides the Captures remaining once the Hero leaves the Nexus', () => {
      const run = createRunStore()
      run.getState().heroMovedTo(nexus)

      run.getState().heroMovedTo(base)

      expect(run.getState().nexusNotice).toBeNull()
    })

    it('reaches Victory when the Hero arrives at the Nexus with 3 Captures', () => {
      const run = createRunStore()
      captureTowers(run, 3)

      run.getState().heroMovedTo(nexus)

      expect(run.getState().nexusNotice).toBe('victory')
      expect(run.getState().victoryReached).toBe(true)
      expect(selectCapturesRemaining(run.getState())).toBe(0)
    })

    it('reaches Victory with more than 3 Captures too', () => {
      const run = createRunStore()
      captureTowers(run, 5)

      run.getState().heroMovedTo(nexus)

      expect(run.getState().nexusNotice).toBe('victory')
    })

    it('closes the Shop when Victory is shown, so the Victory screen is all that is open', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().openShop()

      run.getState().heroMovedTo(nexus)

      expect(run.getState().shopOpen).toBe(false)
    })

    it('stops a Hero passing through the Nexus when Victory is shown', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().setMoveTarget({ x: nexus.x + 10, z: nexus.z })

      run.getState().heroMovedTo(nexus)

      expect(run.getState().nexusNotice).toBe('victory')
      expect(run.getState().moveTarget).toBeNull()
    })

    it('keeps the Victory screen up when the Hero walks away, until it is dismissed', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().heroMovedTo(nexus)

      run.getState().heroMovedTo(base)

      expect(run.getState().nexusNotice).toBe('victory')
    })

    it('continues the Run after Victory is dismissed', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().heroMovedTo(nexus)

      run.getState().dismissVictoryScreen()
      expect(run.getState().nexusNotice).toBeNull()

      // The Hero keeps exploring and Capturing.
      const tower = allTowers()[3]
      run.getState().heroMovedTo(tower.position)
      expect(run.getState().captures.size).toBe(4)
      expect(run.getState().victoryReached).toBe(true)
    })

    it('does not show Victory again on later arrivals at the Nexus', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().heroMovedTo(nexus)
      run.getState().dismissVictoryScreen()

      run.getState().heroMovedTo(base)
      run.getState().heroMovedTo(nexus)

      expect(run.getState().nexusNotice).toBeNull()
    })

    it('does nothing while the Hero stays at the Nexus', () => {
      const run = createRunStore()
      captureTowers(run, 3)
      run.getState().heroMovedTo(nexus)
      run.getState().dismissVictoryScreen()

      run.getState().heroMovedTo({ x: nexus.x + 0.1, z: nexus.z })

      expect(run.getState().nexusNotice).toBeNull()
    })
  })
})

function allTowers() {
  return mapLayout(resumeData).lanes.flatMap((lane) => lane.towers)
}

function towerByEntry(entryId: string) {
  const tower = allTowers().find((t) => t.entryId === entryId)
  if (!tower) throw new Error(`No Tower for ${entryId}`)
  return tower
}

// Captures the first `count` Towers, then returns the Hero to the Base.
function captureTowers(run: ReturnType<typeof createRunStore>, count: number) {
  for (const tower of allTowers().slice(0, count)) run.getState().heroMovedTo(tower.position)
  run.getState().heroMovedTo(mapLayout(resumeData).base)
}

import { describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { MAX_LEVEL, XP_PER_CAPTURE } from './level'
import { createRunStore, selectLevel } from './runStore'

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
})

function allTowers() {
  return mapLayout(resumeData).lanes.flatMap((lane) => lane.towers)
}

function towerByEntry(entryId: string) {
  const tower = allTowers().find((t) => t.entryId === entryId)
  if (!tower) throw new Error(`No Tower for ${entryId}`)
  return tower
}

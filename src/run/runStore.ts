import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { mapLayout, type TowerLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import type { AbilityKey } from '../resume/types'
import { levelForXp, XP_PER_CAPTURE } from './level'
import type { GroundPosition } from './movement'

// How close (in world units) the Hero must stand to a Tower's centre to be
// in its range. Well under half the closest Tower spacing, so ranges never
// overlap.
export const TOWER_RANGE = 2.5

export type RunState = {
  heroPosition: GroundPosition
  moveTarget: GroundPosition | null
  // Resume Entry ids of the Captured Towers.
  captures: ReadonlySet<string>
  // Earned only by Captures. Level is not stored: read it with selectLevel.
  xp: number
  // Resume Entry id whose Info Panel is open, or null.
  openInfoPanel: string | null
  // The latest Ability cast, or null. `id` is new on every cast, so casting
  // the same key twice is still two changes that subscribers see.
  abilityCast: AbilityCast | null
  heroMovedTo: (position: GroundPosition) => void
  setMoveTarget: (position: GroundPosition) => void
  closeInfoPanel: () => void
  castAbility: (key: AbilityKey) => void
}

export type AbilityCast = {
  key: AbilityKey
  id: number
}

// Builds the state for one Run. A factory (rather than only a module-level
// store) lets each test start from a fresh Run.
export function createRunStore() {
  const layout = mapLayout(resumeData)
  const towers = layout.lanes.flatMap((lane) => lane.towers)

  return createStore<RunState>()((set, get) => ({
    // A copy, so the Run never shares an object with the map layout.
    heroPosition: { ...layout.base },
    moveTarget: null,
    captures: new Set(),
    xp: 0,
    openInfoPanel: null,
    abilityCast: null,

    heroMovedTo: (position) => {
      const state = get()
      const update: Partial<RunState> = {
        heroPosition: position,
        moveTarget: state.moveTarget && isSamePosition(state.moveTarget, position) ? null : state.moveTarget,
      }

      // Called every frame, so act only on the edges: the move that enters a
      // range and the move that leaves it. Staying in range changes nothing,
      // which is what lets Esc close the panel while the Hero stands there.
      const wasIn = towerInRange(towers, state.heroPosition)?.entryId ?? null
      const nowIn = towerInRange(towers, position)?.entryId ?? null
      if (nowIn !== wasIn) {
        if (wasIn !== null) update.openInfoPanel = null
        if (nowIn !== null) {
          // Only the first entry is a Capture; later ones just reopen.
          if (!state.captures.has(nowIn)) {
            update.captures = new Set(state.captures).add(nowIn)
            update.xp = state.xp + XP_PER_CAPTURE
          }
          update.openInfoPanel = nowIn
        }
      }

      set(update)
    },

    closeInfoPanel: () => set({ openInfoPanel: null }),

    setMoveTarget: (position) => set({ moveTarget: position }),

    castAbility: (key) => set((state) => ({ abilityCast: { key, id: (state.abilityCast?.id ?? 0) + 1 } })),
  }))
}

// Level, derived from XP. Returns a number, so a component subscribed with
// `useRunStore(selectLevel)` re-renders only when the Level changes, not on
// every Hero move.
export function selectLevel(state: RunState) {
  return levelForXp(state.xp)
}

// Proximity is a plain distance check against each Tower's centre: no
// physics engine, no colliders. Ranges never overlap, so at most one Tower
// is in range.
function towerInRange(towers: TowerLayout[], position: GroundPosition) {
  return towers.find((tower) => Math.hypot(tower.position.x - position.x, tower.position.z - position.z) <= TOWER_RANGE) ?? null
}

// Exact comparison is enough: stepToward lands exactly on the target.
function isSamePosition(a: GroundPosition, b: GroundPosition) {
  return a.x === b.x && a.z === b.z
}

// The Run for this page visit. Per-frame code reads it with
// `runStore.getState()` (no re-render); components subscribe with
// `useRunStore(selector)` and re-render only when the selected slice changes.
export const runStore = createRunStore()

export function useRunStore<T>(selector: (state: RunState) => T): T {
  return useStore(runStore, selector)
}

import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import type { GroundPosition } from './movement'

export type RunState = {
  heroPosition: GroundPosition
  moveTarget: GroundPosition | null
  heroMovedTo: (position: GroundPosition) => void
  setMoveTarget: (position: GroundPosition) => void
}

// Builds the state for one Run. A factory (rather than only a module-level
// store) lets each test start from a fresh Run.
export function createRunStore() {
  return createStore<RunState>()((set) => ({
    heroPosition: { x: 0, z: 0 },
    moveTarget: null,

    heroMovedTo: (position) =>
      set((state) => ({
        heroPosition: position,
        moveTarget: state.moveTarget && isSamePosition(state.moveTarget, position) ? null : state.moveTarget,
      })),

    setMoveTarget: (position) => set({ moveTarget: position }),
  }))
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

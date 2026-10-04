import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { mapLayout, type TowerLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import type { AbilityKey } from '../resume/types'
import { createFog, isRevealed, revealAround, type Fog } from './fog'
import { levelForXp, XP_PER_CAPTURE } from './level'
import type { GroundPosition } from './movement'

// How close (in world units) the Hero must stand to a Tower's centre to be
// in its range. Well under half the closest Tower spacing, so ranges never
// overlap.
export const TOWER_RANGE = 2.5

// How close the Hero must stand to the Shop's centre to open it. Small
// enough that the Hero spawning at the Base starts out of range.
export const SHOP_RANGE = 2.5

// How close the Hero must stand to the Nexus's centre to arrive at it.
export const NEXUS_RANGE = 2.5

// Captures needed for arriving at the Nexus to be a Victory.
export const CAPTURES_FOR_VICTORY = 3

// What arriving at the Nexus shows: how many Captures remain, or the Victory
// screen.
export type NexusNotice = 'capturesRemaining' | 'victory'

export type RunState = {
  heroPosition: GroundPosition
  moveTarget: GroundPosition | null
  // Resume Entry ids of the Captured Towers.
  captures: ReadonlySet<string>
  // Earned only by Captures. Level is not stored: read it with selectLevel.
  xp: number
  // Resume Entry id whose Info Panel is open, or null.
  openInfoPanel: string | null
  // Whether the Shop panel is open.
  shopOpen: boolean
  // Whether the Inventory panel is open.
  inventoryOpen: boolean
  // What the Nexus is showing, or null.
  nexusNotice: NexusNotice | null
  // Whether Victory was reached this Run. The Victory screen shows only
  // once, so later arrivals at the Nexus show nothing.
  victoryReached: boolean
  // The latest Ability cast, or null. `id` is new on every cast, so casting
  // the same key twice is still two changes that subscribers see.
  abilityCast: AbilityCast | null
  // Which Fog cells the Hero has revealed this Run. A new array whenever
  // more ground is revealed; read it with isRevealed.
  fog: Fog
  heroMovedTo: (position: GroundPosition) => void
  setMoveTarget: (position: GroundPosition) => void
  closeInfoPanel: () => void
  openShop: () => void
  closeShop: () => void
  toggleShop: () => void
  toggleInventory: () => void
  closeInventory: () => void
  dismissVictoryScreen: () => void
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
    shopOpen: false,
    inventoryOpen: false,
    nexusNotice: null,
    victoryReached: false,
    abilityCast: null,
    // The Hero starts at the Base, so the ground around it starts revealed.
    fog: revealAround(createFog(), layout.base),

    heroMovedTo: (position) => {
      const state = get()
      const update: Partial<RunState> = {
        heroPosition: position,
        moveTarget: state.moveTarget && isSamePosition(state.moveTarget, position) ? null : state.moveTarget,
        fog: revealAround(state.fog, position),
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

      // The Shop works the same way: open on entering its range, close on
      // leaving it, nothing in between. A Shop opened from afar (the HUD
      // button) has no entering edge, so it stays open until closed.
      const wasAtShop = isAtShop(layout.shop, state.heroPosition)
      const nowAtShop = isAtShop(layout.shop, position)
      if (nowAtShop !== wasAtShop) update.shopOpen = nowAtShop

      // And the Nexus. Arriving shows the Captures remaining, or Victory the
      // first time there are enough; leaving hides the Captures remaining.
      // The Victory screen stays until dismissed. It stops the Hero (which
      // may only be passing through) and closes the panels, so nothing
      // happens behind it and it is the only thing open.
      const wasAtNexus = isAtNexus(layout.nexus, state.heroPosition)
      const nowAtNexus = isAtNexus(layout.nexus, position)
      if (nowAtNexus && !wasAtNexus) {
        if (state.captures.size < CAPTURES_FOR_VICTORY) {
          update.nexusNotice = 'capturesRemaining'
        } else if (!state.victoryReached) {
          update.nexusNotice = 'victory'
          update.victoryReached = true
          update.moveTarget = null
          update.shopOpen = false
          update.inventoryOpen = false
          update.openInfoPanel = null
        }
      } else if (!nowAtNexus && wasAtNexus && state.nexusNotice === 'capturesRemaining') {
        update.nexusNotice = null
      }

      set(update)
    },

    closeInfoPanel: () => set({ openInfoPanel: null }),

    openShop: () => set({ shopOpen: true }),

    closeShop: () => set({ shopOpen: false }),

    toggleShop: () => set((state) => ({ shopOpen: !state.shopOpen })),

    // The Victory screen is modal, but Tab can still reach the Inventory
    // button behind it; it must not open a panel under the screen.
    toggleInventory: () =>
      set((state) => (state.nexusNotice === 'victory' ? {} : { inventoryOpen: !state.inventoryOpen })),

    closeInventory: () => set({ inventoryOpen: false }),

    dismissVictoryScreen: () => set((state) => (state.nexusNotice === 'victory' ? { nexusNotice: null } : {})),

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

// Captures still needed for Victory; 0 once there are enough.
export function selectCapturesRemaining(state: RunState) {
  return Math.max(0, CAPTURES_FOR_VICTORY - state.captures.size)
}

export type HeroAnimation = 'idle' | 'walk'

// The Hero walks exactly while it has somewhere to go; the move target is
// cleared on arrival.
export function selectHeroAnimation(state: RunState): HeroAnimation {
  return state.moveTarget ? 'walk' : 'idle'
}

// Proximity is a plain distance check against each Tower's centre: no
// physics engine, no colliders. Ranges never overlap, so at most one Tower
// is in range.
function towerInRange(towers: TowerLayout[], position: GroundPosition) {
  return towers.find((tower) => isWithin(tower.position, position, TOWER_RANGE)) ?? null
}

function isAtShop(shop: GroundPosition, position: GroundPosition) {
  return isWithin(shop, position, SHOP_RANGE)
}

function isAtNexus(nexus: GroundPosition, position: GroundPosition) {
  return isWithin(nexus, position, NEXUS_RANGE)
}

function isWithin(a: GroundPosition, b: GroundPosition, range: number) {
  return Math.hypot(a.x - b.x, a.z - b.z) <= range
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

// Whether the ground at `position` is revealed. A boolean, so the component
// re-renders once, when its spot comes out of the Fog, not on every reveal.
export function useRevealed(position: GroundPosition): boolean {
  return useRunStore((state) => isRevealed(state.fog, position))
}

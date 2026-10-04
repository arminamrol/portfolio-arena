import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

export type AssetStatus = 'loading' | 'ready' | 'failed'

export type AssetState = {
  status: AssetStatus
  // How much has loaded, from 0 to 1.
  progress: number
  // Items loaded so far out of the items known so far.
  progressed: (loaded: number, total: number) => void
  loaded: () => void
  failed: () => void
}

// Loading progress for the game's models. Plain data, no three: the App
// shell's loading screen reads it before the game chunk (and three) has
// even arrived.
export const assetStore = createStore<AssetState>()((set, get) => ({
  status: 'loading',
  progress: 0,
  progressed: (loaded, total) => {
    // The total grows as files are discovered (a model asks for its texture
    // only once the model itself has been read), so loaded / total can dip.
    // Holding the highest value seen keeps the bar from jumping backwards.
    if (total > 0) set({ progress: Math.max(get().progress, loaded / total) })
  },
  loaded: () => {
    // Three.js counts a file that failed as finished too, so "everything
    // finished" still arrives after a failure. A failed load stays failed.
    if (get().status !== 'failed') set({ status: 'ready', progress: 1 })
  },
  failed: () => set({ status: 'failed' }),
}))

export function useAssetStore<T>(selector: (state: AssetState) => T): T {
  return useStore(assetStore, selector)
}

import { useCallback, useSyncExternalStore } from 'react'

// The breakpoints the CSS uses too (see the @media rules in src/ui): keep
// them in step. "Small" is any phone, upright or sideways; "narrow" is a
// phone held upright, where the overlay stacks instead of sitting in the
// corners.
export const NARROW_SCREEN_QUERY = '(max-width: 640px)'
export const SMALL_SCREEN_QUERY = `${NARROW_SCREEN_QUERY}, (max-height: 500px)`
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export type DisplayProfile = {
  // Phone-sized: simpler effects, cheaper shadows, a smaller minimap.
  smallScreen: boolean
  // Phone held upright: the minimap moves to the top right.
  narrowScreen: boolean
  // The visitor asked their OS for less motion.
  reducedMotion: boolean
}

// What the game should adapt to on this screen, for this visitor. Follows
// live changes (a rotated phone, a resized window, the OS setting toggled)
// and re-renders only the components that call it.
export function useDisplayProfile(): DisplayProfile {
  const smallScreen = useMediaQuery(SMALL_SCREEN_QUERY)
  const narrowScreen = useMediaQuery(NARROW_SCREEN_QUERY)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  return { smallScreen, narrowScreen, reducedMotion }
}

function useMediaQuery(query: string): boolean {
  // Stable per query: a new subscribe function would make React unsubscribe
  // and subscribe again on every render.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = mediaQueryList(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => mediaQueryList(query)?.matches ?? false)
}

// Missing in old browsers and in jsdom; then assume a large screen and
// full motion, the layout the game was first built for.
function mediaQueryList(query: string) {
  return typeof window.matchMedia === 'function' ? window.matchMedia(query) : undefined
}

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDisplayProfile } from './displayProfile'

// jsdom has no matchMedia. This stand-in answers each query from the
// `matches` table and lets a test flip one, firing 'change' like a browser
// does when the window is resized or the OS setting changes.
const matches = new Map<string, boolean>()
const listeners = new Map<string, Set<() => void>>()

function fakeMatchMedia(query: string) {
  return {
    get matches() {
      return matches.get(query) ?? false
    },
    addEventListener: (_type: 'change', listener: () => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set())
      listeners.get(query)!.add(listener)
    },
    removeEventListener: (_type: 'change', listener: () => void) => listeners.get(query)?.delete(listener),
  }
}

function setMedia(query: string, value: boolean) {
  matches.set(query, value)
  listeners.get(query)?.forEach((listener) => listener())
}

describe('useDisplayProfile', () => {
  beforeEach(() => {
    matches.clear()
    listeners.clear()
    vi.stubGlobal('matchMedia', fakeMatchMedia)
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('describes a large screen with motion allowed by default', () => {
    const { result } = renderHook(() => useDisplayProfile())

    expect(result.current).toEqual({ smallScreen: false, narrowScreen: false, reducedMotion: false })
  })

  it('reports a phone held upright as small and narrow', () => {
    setMedia('(max-width: 640px)', true)
    setMedia('(max-width: 640px), (max-height: 500px)', true)

    const { result } = renderHook(() => useDisplayProfile())

    expect(result.current.smallScreen).toBe(true)
    expect(result.current.narrowScreen).toBe(true)
  })

  it('reports a phone turned sideways as small but not narrow', () => {
    setMedia('(max-width: 640px), (max-height: 500px)', true)

    const { result } = renderHook(() => useDisplayProfile())

    expect(result.current.smallScreen).toBe(true)
    expect(result.current.narrowScreen).toBe(false)
  })

  it('follows the visitor turning reduced motion on while the page is open', () => {
    const { result } = renderHook(() => useDisplayProfile())

    act(() => setMedia('(prefers-reduced-motion: reduce)', true))

    expect(result.current.reducedMotion).toBe(true)
  })

  it('assumes a large screen with motion when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)

    const { result } = renderHook(() => useDisplayProfile())

    expect(result.current).toEqual({ smallScreen: false, narrowScreen: false, reducedMotion: false })
  })
})

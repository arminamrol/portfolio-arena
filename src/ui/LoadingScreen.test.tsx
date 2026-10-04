import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assetStore } from '../assets/assetStore'
import { LoadingScreen } from './LoadingScreen'

describe('LoadingScreen', () => {
  beforeEach(() => assetStore.setState(assetStore.getInitialState(), true))
  afterEach(cleanup)

  it('shows an empty progress bar before anything has loaded', () => {
    render(<LoadingScreen />)

    const bar = screen.getByRole('progressbar', { name: 'Loading the game' })
    expect(bar.getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('shows how much has loaded so far', () => {
    render(<LoadingScreen />)
    act(() => assetStore.getState().progressed(3, 12))

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25')
    expect(screen.getByText('25%')).toBeTruthy()
  })

  it('never goes backwards when more files are discovered mid-load', () => {
    render(<LoadingScreen />)
    act(() => {
      assetStore.getState().progressed(3, 4)
      // A model asks for its texture: one more item loaded, two more known.
      assetStore.getState().progressed(4, 6)
    })

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('75')
  })

  it('disappears once everything has loaded', () => {
    render(<LoadingScreen />)
    act(() => assetStore.getState().loaded())

    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByText(/loading/i)).toBeNull()
  })

  it('says so and points to the Plain Resume when loading fails', () => {
    render(<LoadingScreen />)
    act(() => assetStore.getState().failed())

    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByRole('alert').textContent).toMatch(/could not load.*Skip to resume/i)
  })

  it('keeps showing the failure when the remaining files finish afterwards', () => {
    render(<LoadingScreen />)
    act(() => {
      assetStore.getState().failed()
      // Three.js still counts a failed file as finished, so "all loaded"
      // arrives after the failure.
      assetStore.getState().loaded()
    })

    expect(screen.getByRole('alert')).toBeTruthy()
  })
})

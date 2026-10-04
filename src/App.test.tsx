import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

// The game chunk is stood in for by a stub that records being loaded, so the
// tests can tell whether the shell ever asked for it.
const gameLoaded = vi.hoisted(() => vi.fn())
vi.mock('./Game', () => {
  gameLoaded()
  return {
    Game: ({ onSkip }: { onSkip: () => void }) => (
      <main aria-label="Game">
        <button type="button" onClick={onSkip}>
          Skip to resume
        </button>
      </main>
    ),
  }
})
// The shell itself must not reach the 3D code path either.
vi.mock('three', () => {
  throw new Error('The App shell loaded three')
})
vi.mock('@react-three/fiber', () => {
  throw new Error('The App shell loaded @react-three/fiber')
})

describe('App', () => {
  beforeEach(() => gameLoaded.mockClear())
  afterEach(cleanup)

  it('shows the Plain Resume without loading the game when WebGL is unavailable', () => {
    render(<App webglAvailable={false} />)

    expect(screen.getByRole('main', { name: 'Plain Resume' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Play the game' })).toBeNull()
    expect(gameLoaded).not.toHaveBeenCalled()
  })

  it('starts in the game when WebGL is available', async () => {
    render(<App webglAvailable />)

    expect(await screen.findByRole('main', { name: 'Game' })).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Plain Resume' })).toBeNull()
  })

  it('switches from the game to the Plain Resume and back', async () => {
    render(<App webglAvailable />)

    fireEvent.click(await screen.findByRole('button', { name: 'Skip to resume' }))

    const plainResume = screen.getByRole('main', { name: 'Plain Resume' })
    expect(screen.queryByRole('main', { name: 'Game' })).toBeNull()
    expect(plainResume.contains(document.activeElement)).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Play the game' }))

    expect(await screen.findByRole('main', { name: 'Game' })).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Plain Resume' })).toBeNull()
  })
})

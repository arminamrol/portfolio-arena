import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MINIMAP_SIZE, minimapToWorld } from '../minimap/minimapCamera'
import { runStore } from '../run/runStore'
import { Minimap } from './Minimap'

const LEFT = 100
const TOP = 500

describe('Minimap', () => {
  // The minimap writes to the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(cleanup)

  function renderMinimap() {
    render(<Minimap />)
    const minimap = screen.getByLabelText(/minimap/i)
    // jsdom does no layout, so place the frame by hand.
    minimap.getBoundingClientRect = () => new DOMRect(LEFT, TOP, MINIMAP_SIZE, MINIMAP_SIZE)
    return minimap
  }

  it('sets the Hero\'s move target to the world position under a click', () => {
    const minimap = renderMinimap()

    fireEvent.pointerDown(minimap, { button: 0, clientX: LEFT + MINIMAP_SIZE * 0.75, clientY: TOP + MINIMAP_SIZE * 0.25 })

    const expected = minimapToWorld(0.75, 0.25)
    expect(runStore.getState().moveTarget?.x).toBeCloseTo(expected.x)
    expect(runStore.getState().moveTarget?.z).toBeCloseTo(expected.z)
  })

  it('keeps steering while the button is held and dragged, and stops once released', () => {
    const minimap = renderMinimap()

    fireEvent.pointerDown(minimap, { button: 2, clientX: LEFT, clientY: TOP })
    fireEvent.pointerMove(minimap, { buttons: 2, clientX: LEFT + MINIMAP_SIZE, clientY: TOP + MINIMAP_SIZE })

    const dragged = minimapToWorld(1, 1)
    expect(runStore.getState().moveTarget?.x).toBeCloseTo(dragged.x)
    expect(runStore.getState().moveTarget?.z).toBeCloseTo(dragged.z)

    fireEvent.pointerUp(minimap, { button: 2 })
    fireEvent.pointerMove(minimap, { buttons: 0, clientX: LEFT, clientY: TOP })

    expect(runStore.getState().moveTarget?.x).toBeCloseTo(dragged.x)
  })

  it('ignores the middle button', () => {
    const minimap = renderMinimap()

    fireEvent.pointerDown(minimap, { button: 1, clientX: LEFT, clientY: TOP })

    expect(runStore.getState().moveTarget).toBeNull()
  })
})

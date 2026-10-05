import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { runStore } from '../run/runStore'
import { InfoPanel } from './InfoPanel'

describe('InfoPanel', () => {
  // The panel reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(cleanup)

  it('shows the Resume Entry of the Tower the Hero is at, with its Highlights', () => {
    const tower = mapLayout(resumeData).lanes[0].towers[0]
    const entry = Object.values(resumeData.lanes)
      .flatMap((lane) => [...lane.entries])
      .find((e) => e.id === tower.entryId)!
    render(<InfoPanel />)

    act(() => runStore.getState().heroMovedTo(tower.position))

    const panel = screen.getByRole('complementary', { name: entry.title })
    expect(within(panel).getByText(entry.description)).toBeTruthy()
    for (const highlight of entry.highlights) {
      expect(within(panel).getByText(highlight)).toBeTruthy()
    }
  })
})

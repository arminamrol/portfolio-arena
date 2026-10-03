import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { runStore } from '../run/runStore'
import { Hud } from './Hud'

describe('Hud', () => {
  // The HUD reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))

  it('shows the Hero\'s name and Level, and the Level rises with a Capture', () => {
    render(<Hud />)

    expect(screen.getByText(resumeData.hero.name)).toBeTruthy()
    expect(screen.getByText('Level 1')).toBeTruthy()

    const tower = mapLayout(resumeData).lanes[0].towers[0]
    act(() => runStore.getState().heroMovedTo(tower.position))

    expect(screen.getByText('Level 2')).toBeTruthy()
  })
})

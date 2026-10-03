import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resumeData } from '../resume/resumeData'
import { ABILITY_KEYS } from '../resume/types'
import { runStore } from '../run/runStore'
import { AbilityBar, TOOLTIP_SECONDS } from './AbilityBar'

describe('AbilityBar', () => {
  // The bar reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows a button for each of the four Ability keys', () => {
    render(<AbilityBar />)

    for (const key of ABILITY_KEYS) {
      expect(screen.getByRole('button', { name: new RegExp(`^${key}\\b`) })).toBeTruthy()
    }
  })

  it.each(ABILITY_KEYS)('pressing %s casts it and shows its Skill', (key) => {
    render(<AbilityBar />)

    fireEvent.keyDown(window, { code: `Key${key}`, key: key.toLowerCase() })

    const skill = resumeData.skills[key]
    expect(runStore.getState().abilityCast?.key).toBe(key)
    const tooltip = screen.getByRole('status')
    expect(tooltip.textContent).toContain(skill.name)
    expect(tooltip.textContent).toContain(`Level ${skill.level} of 5`)
    expect(tooltip.textContent).toContain(skill.description)
  })

  it('clicking a button casts its Ability and shows its Skill', () => {
    render(<AbilityBar />)

    fireEvent.click(screen.getByRole('button', { name: /^W\b/ }))

    expect(runStore.getState().abilityCast?.key).toBe('W')
    expect(screen.getByRole('status').textContent).toContain(resumeData.skills.W.name)
  })

  it('ignores a held key repeating and keys pressed with a modifier', () => {
    render(<AbilityBar />)

    fireEvent.keyDown(window, { code: 'KeyQ', repeat: true })
    fireEvent.keyDown(window, { code: 'KeyR', metaKey: true })
    fireEvent.keyDown(window, { code: 'KeyW', ctrlKey: true })

    expect(runStore.getState().abilityCast).toBeNull()
  })

  it('hides the tooltip a few seconds after the last cast', () => {
    vi.useFakeTimers()
    render(<AbilityBar />)

    fireEvent.keyDown(window, { code: 'KeyE' })
    act(() => vi.advanceTimersByTime(TOOLTIP_SECONDS * 1000 - 100))
    // A new cast restarts the clock.
    fireEvent.keyDown(window, { code: 'KeyQ' })
    act(() => vi.advanceTimersByTime(TOOLTIP_SECONDS * 1000 - 100))
    expect(screen.getByRole('status').textContent).toContain(resumeData.skills.Q.name)

    act(() => vi.advanceTimersByTime(200))
    expect(screen.getByRole('status').textContent).toBe('')
  })
})

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { runStore } from '../run/runStore'
import { NexusNotice } from './NexusNotice'

const layout = mapLayout(resumeData)
const towers = layout.lanes.flatMap((lane) => lane.towers)

function captureTowers(count: number) {
  for (const tower of towers.slice(0, count)) runStore.getState().heroMovedTo(tower.position)
  runStore.getState().heroMovedTo(layout.base)
}

describe('NexusNotice', () => {
  // Reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(cleanup)

  it('shows nothing away from the Nexus', () => {
    render(<NexusNotice />)

    expect(screen.queryByRole('status')?.textContent ?? '').toBe('')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('says how many Captures remain when the Hero reaches the Nexus too early', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(1)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    expect(screen.getByRole('status').textContent).toMatch(/2 more Captures/)
  })

  it('uses the singular for the last Capture', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(2)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    expect(screen.getByRole('status').textContent).toMatch(/1 more Capture\b/)
  })

  it('shows the Victory screen with every Contact Link as a call to action', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(3)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    const dialog = screen.getByRole('dialog', { name: 'Victory' })
    const links = within(dialog).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(resumeData.contactLinks.map((link) => link.url))
    expect(within(dialog).getByRole('link', { name: /Email/ }).getAttribute('href')).toMatch(/^mailto:/)
  })

  it('moves focus into the Victory screen', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(3)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    expect(screen.getByRole('dialog', { name: 'Victory' }).contains(document.activeElement)).toBe(true)
  })

  it('is dismissed with its button and lets the Run continue', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(3)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Keep exploring' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(runStore.getState().nexusNotice).toBeNull()
  })

  it('is dismissed with Esc', () => {
    render(<NexusNotice />)
    act(() => {
      captureTowers(3)
      runStore.getState().heroMovedTo(layout.nexus)
    })

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

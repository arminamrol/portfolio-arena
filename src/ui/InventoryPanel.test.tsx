import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resumeData } from '../resume/resumeData'
import { runStore } from '../run/runStore'
import { AbilityBar } from './AbilityBar'
import { InventoryPanel } from './InventoryPanel'
import { ShopPanel } from './ShopPanel'

function renderInventory() {
  render(
    <>
      <InventoryPanel />
      <AbilityBar />
    </>,
  )
  return screen.getByRole('button', { name: 'Inventory' })
}

describe('InventoryPanel', () => {
  // The panel reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(cleanup)

  it('is closed at the start of the Run', () => {
    renderInventory()

    expect(screen.queryByRole('complementary', { name: 'Inventory' })).toBeNull()
  })

  it('opens from the button beside the Ability bar and lists every Tool under its group, with no levels', () => {
    const button = renderInventory()
    expect(button.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    const panel = screen.getByRole('complementary', { name: 'Inventory' })
    for (const group of resumeData.inventory) {
      const list = within(panel).getByRole('list', { name: group.label })
      expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(group.tools)
    }
    expect(within(panel).queryByRole('meter')).toBeNull()
    expect(panel.textContent).not.toMatch(/level/i)
  })

  it('closes with the same button', () => {
    const button = renderInventory()

    fireEvent.click(button)
    fireEvent.click(button)

    expect(screen.queryByRole('complementary', { name: 'Inventory' })).toBeNull()
  })

  it('closes with its close button', () => {
    renderInventory()
    act(() => runStore.getState().toggleInventory())

    fireEvent.click(screen.getByRole('button', { name: 'Close Inventory' }))

    expect(screen.queryByRole('complementary', { name: 'Inventory' })).toBeNull()
  })

  it('moves focus into the panel on open and back to the button when Esc closes it', () => {
    const button = renderInventory()

    button.focus()
    fireEvent.click(button)
    const panel = screen.getByRole('complementary', { name: 'Inventory' })
    expect(panel.contains(document.activeElement)).toBe(true)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('complementary', { name: 'Inventory' })).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('closes before the Shop when Esc is pressed with both open, whichever opened first', () => {
    render(
      <>
        <ShopPanel />
        <InventoryPanel />
        <AbilityBar />
      </>,
    )
    act(() => runStore.getState().openShop())
    act(() => runStore.getState().toggleInventory())

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(runStore.getState().inventoryOpen).toBe(false)
    expect(runStore.getState().shopOpen).toBe(true)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(runStore.getState().shopOpen).toBe(false)
  })

  it('does not move the Hero or cast an Ability when opened', () => {
    const button = renderInventory()
    const heroPosition = runStore.getState().heroPosition

    fireEvent.click(button)

    expect(runStore.getState().heroPosition).toEqual(heroPosition)
    expect(runStore.getState().moveTarget).toBeNull()
    expect(runStore.getState().abilityCast).toBeNull()
  })
})

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { runStore } from '../run/runStore'
import { Hud } from './Hud'
import { InfoPanel } from './InfoPanel'
import { ShopPanel } from './ShopPanel'

describe('ShopPanel', () => {
  // The panel reads the page's Run singleton, so start each test from a fresh Run.
  beforeEach(() => runStore.setState(runStore.getInitialState(), true))
  afterEach(cleanup)

  it('is closed at the start of the Run', () => {
    render(<ShopPanel />)

    expect(screen.queryByRole('complementary', { name: 'Shop' })).toBeNull()
  })

  it('lists every Contact Link as a Shop Item', () => {
    render(<ShopPanel />)
    act(() => runStore.getState().openShop())

    const panel = screen.getByRole('complementary', { name: 'Shop' })
    const links = within(panel).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(resumeData.contactLinks.map((link) => link.url))
    for (const contactLink of resumeData.contactLinks) {
      expect(within(panel).getByRole('link', { name: new RegExp(contactLink.label) })).toBeTruthy()
    }
  })

  it('opens web links in a new tab, email in the mail client, and downloads the resume PDF', () => {
    render(<ShopPanel />)
    act(() => runStore.getState().openShop())

    const github = screen.getByRole('link', { name: /GitHub/ })
    expect(github.getAttribute('target')).toBe('_blank')
    expect(github.getAttribute('rel')).toContain('noreferrer')

    const email = screen.getByRole('link', { name: /Email/ })
    expect(email.getAttribute('href')).toMatch(/^mailto:/)
    expect(email.hasAttribute('target')).toBe(false)

    const pdf = screen.getByRole('link', { name: /Resume PDF/ })
    expect(pdf.hasAttribute('download')).toBe(true)
    expect(pdf.hasAttribute('target')).toBe(false)
  })

  it('opens when the Hero walks up to the Shop', () => {
    render(<ShopPanel />)

    act(() => runStore.getState().heroMovedTo(mapLayout(resumeData).shop))

    expect(screen.getByRole('complementary', { name: 'Shop' })).toBeTruthy()
  })

  it('closes with Esc', () => {
    render(<ShopPanel />)
    act(() => runStore.getState().openShop())

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(runStore.getState().shopOpen).toBe(false)
    expect(screen.queryByRole('complementary', { name: 'Shop' })).toBeNull()
  })

  it('closes before the Info Panel when Esc is pressed with both open', () => {
    render(
      <>
        <InfoPanel />
        <ShopPanel />
      </>,
    )
    act(() => runStore.getState().heroMovedTo(mapLayout(resumeData).lanes[0].towers[0].position))
    act(() => runStore.getState().openShop())

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(runStore.getState().shopOpen).toBe(false)
    expect(runStore.getState().openInfoPanel).not.toBeNull()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(runStore.getState().openInfoPanel).toBeNull()
  })

  it('closes with its close button', () => {
    render(<ShopPanel />)
    act(() => runStore.getState().openShop())

    fireEvent.click(screen.getByRole('button', { name: 'Close Shop' }))

    expect(screen.queryByRole('complementary', { name: 'Shop' })).toBeNull()
  })

  it('opens from the HUD Shop button, moving focus into the panel and back to the button on close', () => {
    render(
      <>
        <Hud />
        <ShopPanel />
      </>,
    )
    const shopButton = screen.getByRole('button', { name: 'Shop' })
    expect(shopButton.getAttribute('aria-expanded')).toBe('false')

    shopButton.focus()
    fireEvent.click(shopButton)

    const panel = screen.getByRole('complementary', { name: 'Shop' })
    expect(shopButton.getAttribute('aria-expanded')).toBe('true')
    expect(panel.contains(document.activeElement)).toBe(true)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(document.activeElement).toBe(shopButton)
  })

  it('does not steal focus when the Hero walks up to the Shop', () => {
    render(<ShopPanel />)
    const before = document.activeElement

    act(() => runStore.getState().heroMovedTo(mapLayout(resumeData).shop))

    expect(document.activeElement).toBe(before)
  })
})

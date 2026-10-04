import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resumeData } from '../resume/resumeData'
import { ABILITY_KEYS, MAX_SKILL_LEVEL } from '../resume/types'
import { PlainResume } from './PlainResume'

// The Plain Resume must never load the 3D code path. If anything it imports
// reaches three or React Three Fiber, importing it fails these mocks.
vi.mock('three', () => {
  throw new Error('The Plain Resume loaded three')
})
vi.mock('@react-three/fiber', () => {
  throw new Error('The Plain Resume loaded @react-three/fiber')
})

const lanes = Object.values(resumeData.lanes)

describe('PlainResume', () => {
  afterEach(cleanup)

  it('shows the hero summary', () => {
    render(<PlainResume />)

    const header = screen.getByRole('banner')
    expect(within(header).getByRole('heading', { level: 1, name: resumeData.hero.name })).toBeTruthy()
    expect(within(header).getByText(resumeData.hero.title)).toBeTruthy()
    expect(within(header).getByText(resumeData.hero.summary)).toBeTruthy()
  })

  it('shows every Resume Entry under its Lane, with its Highlights and links', () => {
    render(<PlainResume />)

    for (const lane of lanes) {
      const section = screen.getByRole('region', { name: lane.label })
      for (const entry of lane.entries) {
        const article = within(section).getByRole('article', { name: entry.title })
        expect(within(article).getByText(entry.subtitle)).toBeTruthy()
        expect(within(article).getByText(entry.description)).toBeTruthy()
        for (const highlight of entry.highlights) {
          expect(within(article).getByText(highlight)).toBeTruthy()
        }
        for (const link of entry.links) {
          expect(within(article).getByRole('link', { name: link.label }).getAttribute('href')).toBe(link.url)
        }
      }
    }
  })

  it('shows every Skill with its level', () => {
    render(<PlainResume />)

    const section = screen.getByRole('region', { name: 'Skills' })
    for (const key of ABILITY_KEYS) {
      const skill = resumeData.skills[key]
      const item = within(section).getByRole('article', { name: skill.name })
      expect(within(item).getByText(skill.description)).toBeTruthy()
      expect(within(item).getByRole('meter', { name: `${skill.name} level` }).getAttribute('aria-valuenow')).toBe(
        String(skill.level),
      )
      expect(within(item).getByText(`${skill.level} / ${MAX_SKILL_LEVEL}`)).toBeTruthy()
    }
  })

  it('lists the Inventory, every Tool under its group, with no levels', () => {
    render(<PlainResume />)

    const section = screen.getByRole('region', { name: 'Inventory' })
    for (const group of resumeData.inventory) {
      const list = within(section).getByRole('list', { name: group.label })
      expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(group.tools)
    }
    expect(within(section).queryByRole('meter')).toBeNull()
  })

  it('lists every Contact Link with a working URL', () => {
    render(<PlainResume />)

    const section = screen.getByRole('region', { name: 'Contact' })
    const links = within(section).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(resumeData.contactLinks.map((link) => link.url))
    expect(within(section).getByRole('link', { name: /Resume PDF/ }).hasAttribute('download')).toBe(true)
    expect(within(section).getByRole('link', { name: /Email/ }).hasAttribute('target')).toBe(false)
    expect(within(section).getByRole('link', { name: /GitHub/ }).getAttribute('target')).toBe('_blank')
  })

  it('offers the game when it can run, and switches to it', () => {
    const onPlay = vi.fn()
    render(<PlainResume onPlay={onPlay} />)

    fireEvent.click(screen.getByRole('button', { name: 'Play the game' }))

    expect(onPlay).toHaveBeenCalledOnce()
  })

  it('does not offer the game when it cannot run', () => {
    render(<PlainResume />)

    expect(screen.queryByRole('button', { name: 'Play the game' })).toBeNull()
  })
})

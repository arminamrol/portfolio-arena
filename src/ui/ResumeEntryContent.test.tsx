import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ResumeEntry } from '../resume/types'
import { ResumeEntryContent } from './ResumeEntryContent'

const entry: ResumeEntry = {
  id: 'e',
  title: 'Title',
  subtitle: 'Subtitle',
  description: 'Built the checkout.',
  highlights: ['Cut load time by 40%', 'Mentored three developers'],
  links: [],
}

describe('ResumeEntryContent', () => {
  afterEach(cleanup)

  it('shows the description, then the Highlights as a list', () => {
    render(<ResumeEntryContent entry={entry} />)

    const description = screen.getByText(entry.description)
    const list = screen.getByRole('list', { name: 'Highlights' })
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(entry.highlights)
    expect(description.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('shows no list for an entry without Highlights', () => {
    render(<ResumeEntryContent entry={{ ...entry, highlights: [] }} />)

    expect(screen.getByText(entry.description)).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })
})

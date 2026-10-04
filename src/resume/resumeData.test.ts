import { describe, expect, it } from 'vitest'
import { resumeData } from './resumeData'
import type { Lane, ResumeData, ResumeEntry, Skill } from './types'

const entry: ResumeEntry = {
  id: 'e',
  title: 'Title',
  subtitle: 'Subtitle',
  description: 'Description',
  highlights: [],
  links: [],
}

// These checks run in `pnpm typecheck`, not at test time: every expected
// error below fails the typecheck if its line stops being an error, i.e. if
// the Resume Data types get looser.
describe('Resume Data types', () => {
  it('reject a Skill level outside 1–5', () => {
    // @ts-expect-error level 6 is out of range
    void ({ name: 'React', level: 6, description: 'd' } satisfies Skill)
    // @ts-expect-error level 0 is out of range
    void ({ name: 'React', level: 0, description: 'd' } satisfies Skill)
  })

  it('reject a Skill without a description', () => {
    // @ts-expect-error description is missing
    void ({ name: 'React', level: 3 } satisfies Skill)
  })

  it('accept a Lane with 1–4 Resume Entries', () => {
    void ({ label: 'Projects', entries: [entry] } satisfies Lane)
    void ({ label: 'Projects', entries: [entry, entry, entry, entry] } satisfies Lane)
  })

  it('reject a Lane with no Resume Entries or more than 4', () => {
    // @ts-expect-error an empty Lane has no Towers
    void ({ label: 'Projects', entries: [] } satisfies Lane)
    // @ts-expect-error five entries are too many
    void ({ label: 'Projects', entries: [entry, entry, entry, entry, entry] } satisfies Lane)
  })

  it('reject a Resume Entry missing a required field', () => {
    // @ts-expect-error description is missing
    void ({ id: 'e', title: 'Title', subtitle: 'Subtitle', highlights: [], links: [] } satisfies ResumeEntry)
    // @ts-expect-error highlights is missing
    void ({ id: 'e', title: 'Title', subtitle: 'Subtitle', description: 'Description', links: [] } satisfies ResumeEntry)
  })

  it('reject Resume Data missing a Skill', () => {
    const { R: _, ...threeSkills } = resumeData.skills
    // @ts-expect-error the R Skill is missing
    void ({ ...resumeData, skills: threeSkills } satisfies ResumeData)
  })
})

describe('Resume Data', () => {
  it('gives every Resume Entry a unique id', () => {
    const ids = Object.values(resumeData.lanes).flatMap((lane) => lane.entries.map((e) => e.id))

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists the owner\'s Contact Links, with the Resume PDF hosted as a GitHub Release asset', () => {
    expect(resumeData.contactLinks).toEqual([
      { label: 'GitHub', url: 'https://github.com/arminamrol/' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/armin-amrollahian/' },
      { label: 'Email', url: 'mailto:arminamrol@gmail.com' },
      {
        label: 'Resume PDF',
        url: 'https://github.com/arminamrol/portfolio-arena/releases/latest/download/Armin-Amrollahian.pdf',
      },
    ])
  })
})

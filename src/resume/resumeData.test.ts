import { describe, expect, it } from 'vitest'
import { resumeData } from './resumeData'
import type { Lane, ResumeData, ResumeEntry, Skill } from './types'

const entry: ResumeEntry = { id: 'e', title: 'Title', subtitle: 'Subtitle', body: 'Body', links: [] }

// These checks run in `pnpm typecheck`, not at test time: every expected
// error below fails the typecheck if its line stops being an error, i.e. if
// the Resume Data types get looser.
describe('Resume Data types', () => {
  it('reject a Skill level outside 1–5', () => {
    // @ts-expect-error level 6 is out of range
    void ({ name: 'React', level: 6 } satisfies Skill)
    // @ts-expect-error level 0 is out of range
    void ({ name: 'React', level: 0 } satisfies Skill)
  })

  it('reject a Lane with fewer than 2 or more than 3 Resume Entries', () => {
    // @ts-expect-error one entry is too few
    void ({ label: 'Projects', entries: [entry] } satisfies Lane)
    // @ts-expect-error four entries are too many
    void ({ label: 'Projects', entries: [entry, entry, entry, entry] } satisfies Lane)
  })

  it('reject a Resume Entry missing a required field', () => {
    // @ts-expect-error body is missing
    void ({ id: 'e', title: 'Title', subtitle: 'Subtitle', links: [] } satisfies ResumeEntry)
  })

  it('reject Resume Data missing a Skill', () => {
    const { R: _, ...threeSkills } = resumeData.skills
    // @ts-expect-error the R Skill is missing
    void ({ ...resumeData, skills: threeSkills } satisfies ResumeData)
  })
})

describe('placeholder Resume Data', () => {
  it('gives every Resume Entry a unique id', () => {
    const ids = Object.values(resumeData.lanes).flatMap((lane) => lane.entries.map((e) => e.id))

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has four Contact Links', () => {
    expect(resumeData.contactLinks).toHaveLength(4)
  })
})

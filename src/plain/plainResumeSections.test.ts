import { describe, expect, it } from 'vitest'
import { resumeData } from '../resume/resumeData'
import type { ResumeData, ResumeEntry } from '../resume/types'
import { plainResumeSections } from './plainResumeSections'

const base = { subtitle: 's', description: 'd', highlights: [], links: [] }
const job = (id: string, started: string): ResumeEntry => ({ ...base, id, title: id, kind: 'experience', started })
const project = (id: string): ResumeEntry => ({ ...base, id, title: id, kind: 'project' })
const degree = (id: string): ResumeEntry => ({ ...base, id, title: id, kind: 'education' })

describe('plainResumeSections', () => {
  it('groups Resume Entries by kind, not by Lane: Experience, then Projects, then Education', () => {
    const data = {
      ...resumeData,
      lanes: {
        top: { label: 'Beginnings', entries: [degree('school'), job('first-job', '2019-03')] },
        mid: { label: 'Projects', entries: [project('app'), project('site')] },
        bottom: { label: 'Experience', entries: [job('current-job', '2024-06')] },
      },
    } satisfies ResumeData

    expect(plainResumeSections(data).map((section) => [section.title, section.entries.map((e) => e.id)])).toEqual([
      ['Experience', ['current-job', 'first-job']],
      ['Projects', ['app', 'site']],
      ['Education', ['school']],
    ])
  })

  it('orders Experience newest first by start date, whichever Lane holds it', () => {
    const data = {
      ...resumeData,
      lanes: {
        top: { label: 'Beginnings', entries: [job('freelance', '2016'), job('roomak', '2019-03')] },
        mid: { label: 'Projects', entries: [project('app')] },
        bottom: { label: 'Experience', entries: [job('digikala', '2024-06'), job('nexu', '2023-07')] },
      },
    } satisfies ResumeData

    expect(plainResumeSections(data)[0].entries.map((e) => e.id)).toEqual(['digikala', 'nexu', 'roomak', 'freelance'])
  })

  it('leaves out a kind with no Resume Entries', () => {
    const data = {
      ...resumeData,
      lanes: {
        top: { label: 'A', entries: [project('a')] },
        mid: { label: 'B', entries: [project('b')] },
        bottom: { label: 'C', entries: [job('c', '2020')] },
      },
    } satisfies ResumeData

    expect(plainResumeSections(data).map((section) => section.title)).toEqual(['Experience', 'Projects'])
  })
})

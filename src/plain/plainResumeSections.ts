import type { EntryKind, ResumeData, ResumeEntry } from '../resume/types'

export type PlainResumeSection = {
  kind: EntryKind
  title: string
  entries: ResumeEntry[]
}

const SECTIONS: { kind: EntryKind; title: string }[] = [
  { kind: 'experience', title: 'Experience' },
  { kind: 'project', title: 'Projects' },
  { kind: 'education', title: 'Education' },
]

// The Resume Entries grouped the way a standard resume reads, whichever Lane
// holds them: Experience newest first, then Projects and Education in Lane
// order. A kind with no entries is left out.
export function plainResumeSections(resumeData: ResumeData): PlainResumeSection[] {
  const entries = Object.values(resumeData.lanes).flatMap((lane) => [...lane.entries])
  return SECTIONS.map(({ kind, title }) => ({
    kind,
    title,
    entries: kind === 'experience' ? newestFirst(entries) : entries.filter((entry) => entry.kind === kind),
  })).filter((section) => section.entries.length > 0)
}

function newestFirst(entries: ResumeEntry[]) {
  return entries
    .flatMap((entry) => (entry.kind === 'experience' ? [entry] : []))
    .sort((a, b) => b.started.localeCompare(a.started))
}

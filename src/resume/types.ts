// The shape of the Resume Data. The resume itself lives in resumeData.ts and
// is checked against these types with `satisfies`, so a mistake in the
// content is a compile error rather than a broken map.

export type Link = {
  label: string
  url: string
}

// One degree, job, or project. Shown by exactly one Tower.
export type ResumeEntry = {
  id: string
  title: string
  subtitle: string
  // One or two sentences on what the degree, job or project was.
  description: string
  // One achievement each, ideally with a measurable result. Shown as a
  // bulleted list after the description; may be empty.
  highlights: string[]
  links: Link[]
}

// A Lane holds 1–4 Towers, so it holds a 1- to 4-element tuple of entries.
export type LaneEntries =
  | [ResumeEntry]
  | [ResumeEntry, ResumeEntry]
  | [ResumeEntry, ResumeEntry, ResumeEntry]
  | [ResumeEntry, ResumeEntry, ResumeEntry, ResumeEntry]

export type Lane = {
  label: string
  entries: LaneEntries
}

export type LaneKey = 'top' | 'mid' | 'bottom'

export type SkillLevel = 1 | 2 | 3 | 4 | 5

export const MAX_SKILL_LEVEL = 5

export type Skill = {
  name: string
  level: SkillLevel
  // One or two sentences, shown in the Ability's tooltip.
  description: string
}

// The four Ability keys, in Ability bar order; each reveals one Skill.
export const ABILITY_KEYS = ['Q', 'W', 'E', 'R'] as const
export type AbilityKey = (typeof ABILITY_KEYS)[number]

// One technology in the Inventory: just its name, with no proficiency level.
export type Tool = string

// One area of the Inventory (Frontend, Backend & Data, ...) and its Tools.
export type ToolGroup = {
  label: string
  tools: Tool[]
}

// GitHub, LinkedIn, email, resume PDF. Shown as Shop Items.
export type ContactLink = Link

export type ResumeData = {
  hero: {
    name: string
    title: string
    summary: string
  }
  lanes: Record<LaneKey, Lane>
  skills: Record<AbilityKey, Skill>
  // The owner's full set of Tools, grouped by area, in display order. Shown
  // in the Inventory panel and the Plain Resume.
  inventory: ToolGroup[]
  contactLinks: ContactLink[]
}

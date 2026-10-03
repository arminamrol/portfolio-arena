// Every Capture grants the same XP.
export const XP_PER_CAPTURE = 100

// The Level curve: the XP needed to reach each Level, Level 1 first. This is
// the one place Level is derived from XP. Levels come at 1, 2, 4 and 6
// Captures: quick early, slower later, and every map (at least 6 Towers) can
// reach the top.
const LEVEL_THRESHOLDS = [0, 1, 2, 4, 6].map((captures) => captures * XP_PER_CAPTURE)

export const MAX_LEVEL = LEVEL_THRESHOLDS.length

export function levelForXp(xp: number): number {
  return LEVEL_THRESHOLDS.filter((threshold) => xp >= threshold).length
}

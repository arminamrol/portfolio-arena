import { useEffect, useState } from 'react'
import { resumeData } from '../resume/resumeData'
import { ABILITY_KEYS, MAX_SKILL_LEVEL, type AbilityKey } from '../resume/types'
import { runStore, useRunStore } from '../run/runStore'
import './AbilityBar.css'

// How long a Skill's tooltip stays up after the last cast.
export const TOOLTIP_SECONDS = 4

// Matched on KeyboardEvent.code (the physical key), not .key (the
// character), so the four keys stay in one row on AZERTY or Dvorak too.
const abilityByCode = new Map<string, AbilityKey>(ABILITY_KEYS.map((key) => [`Key${key}`, key]))

// The four Ability keys, bottom centre, with the cast Skill's tooltip above
// them. Plain DOM over the canvas; the effect itself is drawn by the scene's
// AbilityEffects, which hears about the cast through the Run store.
export function AbilityBar() {
  const cast = useRunStore((state) => state.abilityCast)
  // The cast whose tooltip has timed out, so the tooltip hides without
  // touching the store.
  const [expiredId, setExpiredId] = useState<number | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // A held key auto-repeats; one press is one cast. Modifiers are the
      // browser's (Cmd+R reloads, Ctrl+W closes the tab), not ours.
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const key = abilityByCode.get(event.code)
      if (key) runStore.getState().castAbility(key)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Every cast has a new id, so every cast restarts the countdown.
  useEffect(() => {
    if (!cast) return
    const timer = setTimeout(() => setExpiredId(cast.id), TOOLTIP_SECONDS * 1000)
    return () => clearTimeout(timer)
  }, [cast])

  const visibleCast = cast && cast.id !== expiredId ? cast : null
  const skill = visibleCast && resumeData.skills[visibleCast.key]

  return (
    <div className="ability-bar">
      {/* Always present, so screen readers announce each new tooltip.
          role="status" is an implicit aria-live="polite" region, the same
          pattern as InfoPanel. */}
      <div role="status" className="ability-bar__tooltip-slot">
        {skill && visibleCast && (
          // Keyed by cast so every cast replays the pop-in.
          <div key={visibleCast.id} className="ability-tooltip">
            <p className="ability-tooltip__name">{skill.name}</p>
            <p className="ability-tooltip__level">
              <span className="ability-tooltip__pips" aria-hidden="true">
                {Array.from({ length: MAX_SKILL_LEVEL }, (_, i) => i + 1).map((pip) => (
                  <span key={pip} className={pip <= skill.level ? 'ability-tooltip__pip--on' : 'ability-tooltip__pip'} />
                ))}
              </span>
              Level {skill.level} of {MAX_SKILL_LEVEL}
            </p>
            <p className="ability-tooltip__description">{skill.description}</p>
          </div>
        )}
      </div>
      <div className="ability-bar__keys">
        {ABILITY_KEYS.map((key) => {
          const { name } = resumeData.skills[key]
          return (
            <button
              key={key}
              type="button"
              className={visibleCast?.key === key ? 'ability-key ability-key--active' : 'ability-key'}
              // Without it the two spans' text runs together as "QReact".
              aria-label={`${key}: ${name}`}
              onClick={() => runStore.getState().castAbility(key)}
            >
              <span className="ability-key__letter">{key}</span>
              <span className="ability-key__skill">{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

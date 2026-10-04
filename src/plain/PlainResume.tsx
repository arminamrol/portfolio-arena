import { useLayoutEffect, useRef } from 'react'
import { resumeData } from '../resume/resumeData'
import { ABILITY_KEYS, MAX_SKILL_LEVEL, type AbilityKey, type ResumeEntry, type Skill } from '../resume/types'
import { contactLinkAttributes, contactLinkHint } from '../ui/contactLinks'
import { ResumeEntryContent } from '../ui/ResumeEntryContent'
import './PlainResume.css'

type PlainResumeProps = {
  // Switches to the game. Left out when the game cannot run (no WebGL), so
  // the Plain Resume never offers a broken canvas.
  onPlay?: () => void
  // Take focus on mount, for when the visitor switched here from the game
  // and focus would otherwise be dropped with the Skip control.
  takeFocus?: boolean
}

// The whole Resume Data as plain, scrollable HTML. It must never import the
// 3D code path (three, React Three Fiber, the scene, or the game UI that
// reads from them), so it opens without downloading the 3D engine.
export function PlainResume({ onPlay, takeFocus = false }: PlainResumeProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    if (takeFocus) headingRef.current?.focus()
  }, [takeFocus])

  return (
    <main className="plain-resume" aria-label="Plain Resume">
      <div className="plain-resume__page">
        <header className="plain-resume__header">
          <h1 ref={headingRef} className="plain-resume__name" tabIndex={-1}>
            {resumeData.hero.name}
          </h1>
          <p className="plain-resume__title">{resumeData.hero.title}</p>
          <p className="plain-resume__summary">{resumeData.hero.summary}</p>
          {onPlay && (
            <button type="button" className="plain-resume__play" onClick={onPlay}>
              Play the game
            </button>
          )}
        </header>

        {Object.entries(resumeData.lanes).map(([laneKey, lane]) => (
          <section key={laneKey} className="plain-resume__section" aria-labelledby={`plain-resume-${laneKey}`}>
            <h2 id={`plain-resume-${laneKey}`} className="plain-resume__section-title">
              {lane.label}
            </h2>
            {lane.entries.map((entry) => (
              <PlainResumeEntry key={entry.id} entry={entry} />
            ))}
          </section>
        ))}

        <section className="plain-resume__section" aria-labelledby="plain-resume-skills">
          <h2 id="plain-resume-skills" className="plain-resume__section-title">
            Skills
          </h2>
          <div className="plain-resume__skills">
            {ABILITY_KEYS.map((key) => (
              <PlainResumeSkill key={key} abilityKey={key} skill={resumeData.skills[key]} />
            ))}
          </div>
        </section>

        <section className="plain-resume__section" aria-labelledby="plain-resume-inventory">
          <h2 id="plain-resume-inventory" className="plain-resume__section-title">
            Inventory
          </h2>
          <div className="plain-resume__inventory">
            {resumeData.inventory.map((group, index) => {
              const labelId = `plain-resume-inventory-${index}`
              return (
                <div key={group.label}>
                  <h3 id={labelId} className="plain-resume__inventory-group">
                    {group.label}
                  </h3>
                  <ul className="plain-resume__tools" aria-labelledby={labelId}>
                    {group.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        <section className="plain-resume__section" aria-labelledby="plain-resume-contact">
          <h2 id="plain-resume-contact" className="plain-resume__section-title">
            Contact
          </h2>
          <ul className="plain-resume__contact-links">
            {resumeData.contactLinks.map((contactLink) => (
              <li key={contactLink.url}>
                <a href={contactLink.url} {...contactLinkAttributes(contactLink.url)}>
                  {contactLink.label}
                </a>{' '}
                <span className="plain-resume__hint">({contactLinkHint(contactLink.url)})</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

function PlainResumeEntry({ entry }: { entry: ResumeEntry }) {
  const titleId = `plain-resume-entry-${entry.id}`
  return (
    <article className="plain-resume__entry" aria-labelledby={titleId}>
      <h3 id={titleId} className="plain-resume__entry-title">
        {entry.title}
      </h3>
      <p className="plain-resume__entry-subtitle">{entry.subtitle}</p>
      <ResumeEntryContent entry={entry} />
      {entry.links.length > 0 && (
        <ul className="plain-resume__entry-links">
          {entry.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function PlainResumeSkill({ abilityKey, skill }: { abilityKey: AbilityKey; skill: Skill }) {
  const nameId = `plain-resume-skill-${abilityKey}`
  return (
    <article className="plain-resume__skill" aria-labelledby={nameId}>
      <h3 id={nameId} className="plain-resume__skill-name">
        {skill.name}
      </h3>
      <p className="plain-resume__skill-level">
        <span
          className="plain-resume__meter"
          role="meter"
          aria-label={`${skill.name} level`}
          aria-valuemin={1}
          aria-valuemax={MAX_SKILL_LEVEL}
          aria-valuenow={skill.level}
        >
          {Array.from({ length: MAX_SKILL_LEVEL }, (_, index) => (
            <span
              key={index}
              className={`plain-resume__pip${index < skill.level ? ' plain-resume__pip--filled' : ''}`}
            />
          ))}
        </span>{' '}
        {skill.level} / {MAX_SKILL_LEVEL}
      </p>
      <p>{skill.description}</p>
    </article>
  )
}

import { useEffect } from 'react'
import { resumeData } from '../resume/resumeData'
import type { ResumeEntry } from '../resume/types'
import { runStore, useRunStore } from '../run/runStore'
import './InfoPanel.css'

const entriesById = new Map<string, ResumeEntry>(
  Object.values(resumeData.lanes).flatMap((lane) => lane.entries.map((entry) => [entry.id, entry])),
)

// The side panel showing the Resume Entry of the Tower the Hero is at. Plain
// DOM over the canvas, so its text is selectable and screen readers read it.
export function InfoPanel() {
  const entryId = useRunStore((state) => state.openInfoPanel)
  const entry = entryId === null ? undefined : entriesById.get(entryId)

  useEffect(() => {
    if (!entry) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') runStore.getState().closeInfoPanel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [entry])

  return (
    // The panel opens because the Hero walked somewhere, not because of a
    // keypress, so it must not steal focus (walking past a Tower would yank
    // it away). Instead this always-present live region makes screen readers
    // announce the panel when it appears; Tab reaches its links and close
    // button, since it follows the canvas in the DOM.
    <div aria-live="polite">
      {entry && (
        // Keyed by entry so walking from one Tower to another replays the
        // slide-in.
        <aside key={entry.id} className="info-panel" aria-labelledby="info-panel-title">
          <button
            type="button"
            className="info-panel__close"
            aria-label="Close"
            onClick={() => runStore.getState().closeInfoPanel()}
          >
            ×
          </button>
          <h2 id="info-panel-title" className="info-panel__title">
            {entry.title}
          </h2>
          <p className="info-panel__subtitle">{entry.subtitle}</p>
          <p className="info-panel__body">{entry.body}</p>
          {entry.links.length > 0 && (
            <ul className="info-panel__links">
              {entry.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  )
}

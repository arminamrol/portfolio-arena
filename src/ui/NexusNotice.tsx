import { useEffect, useLayoutEffect, useRef } from 'react'
import { resumeData } from '../resume/resumeData'
import { runStore, selectCapturesRemaining, useRunStore } from '../run/runStore'
import { contactLinkAttributes, contactLinkHint } from './contactLinks'
import './NexusNotice.css'

// What arriving at the Nexus shows: a short note of the Captures remaining,
// or, once there are enough, the Victory screen.
export function NexusNotice() {
  const nexusNotice = useRunStore((state) => state.nexusNotice)
  const capturesRemaining = useRunStore(selectCapturesRemaining)

  return (
    <>
      {/* Always present, so screen readers announce the note when it appears. */}
      <p role="status" className="nexus-notice">
        {nexusNotice === 'capturesRemaining' && (
          <span className="nexus-notice__text">
            The Nexus holds. {capturesRemaining} more {capturesRemaining === 1 ? 'Capture' : 'Captures'} needed for
            Victory.
          </span>
        )}
      </p>
      {nexusNotice === 'victory' && <VictoryScreen />}
    </>
  )
}

function VictoryScreen() {
  const dialogRef = useRef<HTMLDivElement>(null)
  const captureCount = useRunStore((state) => state.captures.size)

  // Unlike the panels, Victory is modal: it covers the map until dismissed,
  // so it takes focus (a keyboard user could not reach it otherwise) and
  // hands it back to whatever had it on dismissal.
  useLayoutEffect(() => {
    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  useEffect(() => {
    // Capture phase and preventDefault, like the Shop, so this Esc closes
    // only the Victory screen.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      runStore.getState().dismissVictoryScreen()
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  return (
    <div className="victory">
      <div
        ref={dialogRef}
        className="victory__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        tabIndex={-1}
      >
        <h2 id="victory-title" className="victory__title">
          Victory
        </h2>
        <p className="victory__body">
          You took the Nexus with {captureCount} {captureCount === 1 ? 'Capture' : 'Captures'}. Liked what you saw?
          Let's talk.
        </p>
        <ul className="victory__links">
          {resumeData.contactLinks.map((contactLink) => (
            <li key={contactLink.url}>
              <a className="victory__link" href={contactLink.url} {...contactLinkAttributes(contactLink.url)}>
                <span className="victory__link-label">{contactLink.label}</span>
                <span className="victory__link-hint">{contactLinkHint(contactLink.url)}</span>
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="victory__dismiss" onClick={() => runStore.getState().dismissVictoryScreen()}>
          Keep exploring
        </button>
      </div>
    </div>
  )
}

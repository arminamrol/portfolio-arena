import { useLayoutEffect, useRef } from 'react'
import './SkipControl.css'

type SkipControlProps = {
  onSkip: () => void
  // Take focus on mount, for when the visitor switched back from the Plain
  // Resume and focus would otherwise be dropped with its Play button.
  takeFocus?: boolean
}

// "Skip to resume", always visible over the map, bottom left. First in the
// game's DOM order, so it is the first thing Tab reaches, like a skip link.
export function SkipControl({ onSkip, takeFocus = false }: SkipControlProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (takeFocus) buttonRef.current?.focus()
  }, [takeFocus])

  return (
    <button ref={buttonRef} type="button" className="skip-control" onClick={onSkip}>
      Skip to resume
    </button>
  )
}

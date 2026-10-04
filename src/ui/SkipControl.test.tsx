import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SkipControl } from './SkipControl'

describe('SkipControl', () => {
  afterEach(cleanup)

  it('is a focusable button that skips to the resume', () => {
    const onSkip = vi.fn()
    render(<SkipControl onSkip={onSkip} />)

    const button = screen.getByRole('button', { name: 'Skip to resume' })
    button.focus()
    expect(document.activeElement).toBe(button)

    fireEvent.click(button)
    expect(onSkip).toHaveBeenCalledOnce()
  })

  it('leaves focus alone on first load', () => {
    render(<SkipControl onSkip={() => {}} />)

    expect(document.activeElement).toBe(document.body)
  })

  it('takes focus when the visitor comes back from the Plain Resume', () => {
    render(<SkipControl onSkip={() => {}} takeFocus />)

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Skip to resume' }))
  })
})

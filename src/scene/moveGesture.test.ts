import { describe, expect, it } from 'vitest'
import { isMoveGesture } from './moveGesture'

describe('isMoveGesture', () => {
  it('moves the Hero on a right-click', () => {
    expect(isMoveGesture({ pointerType: 'mouse', button: 2, isPrimary: true })).toBe(true)
  })

  it('leaves the left mouse button alone', () => {
    expect(isMoveGesture({ pointerType: 'mouse', button: 0, isPrimary: true })).toBe(false)
  })

  it('moves the Hero on a tap', () => {
    expect(isMoveGesture({ pointerType: 'touch', button: 0, isPrimary: true })).toBe(true)
  })

  it('moves the Hero on a pen tap', () => {
    expect(isMoveGesture({ pointerType: 'pen', button: 0, isPrimary: true })).toBe(true)
  })

  it('ignores a second finger landing during a tap', () => {
    expect(isMoveGesture({ pointerType: 'touch', button: 0, isPrimary: false })).toBe(false)
  })
})

const RIGHT_BUTTON = 2

// The parts of a PointerEvent that decide whether a press on the ground is
// a move order.
export type PointerPress = {
  pointerType: string
  button: number
  isPrimary: boolean
}

// Pointer events cover mouse, touch and pen with one API; pointerType says
// which. With a mouse the Hero moves on a right-click (the left button is
// left free). A finger or pen has no right button: every touch reports
// button 0, so a tap is the move order. Only the first finger down counts
// (isPrimary), so a second finger landing does not yank the Hero away.
export function isMoveGesture({ pointerType, button, isPrimary }: PointerPress): boolean {
  if (pointerType === 'mouse') return button === RIGHT_BUTTON
  return isPrimary
}

import { MathUtils } from 'three'

// A true isometric view puts the camera on the (1, 1, 1) diagonal, looking at
// the origin: 45° around the vertical axis and ~35.264° above the ground.
// Combined with an OrthographicCamera (no perspective), all three world axes
// appear equally foreshortened, which is what gives the "isometric" look.
export function isometricCameraPosition(distance: number): [number, number, number] {
  const d = distance / Math.sqrt(3)
  return [d, d, d]
}

// Where the camera sits relative to the point it looks at. Its height (y)
// never changes; follow slides it across x and z only.
export const CAMERA_OFFSET = isometricCameraPosition(30)

export const MIN_ZOOM = 20
export const MAX_ZOOM = 80

// One wheel "notch" (deltaY ≈ 100) changes zoom by ~10%. Scaling by a factor
// rather than adding a constant makes each notch feel the same whether you
// are zoomed in or out.
export function zoomAfterWheel(zoom: number, wheelDeltaY: number): number {
  return MathUtils.clamp(zoom * Math.exp(-wheelDeltaY * 0.001), MIN_ZOOM, MAX_ZOOM)
}

// How quickly the camera catches up with the Hero (higher = tighter follow).
const FOLLOW_SHARPNESS = 5

// One frame of the camera following the Hero along one axis. Damping makes
// it fast when far behind, slowing as it closes in, so the view glides
// after the Hero and keeps drifting a moment after the Hero stops. That
// lag-and-settle is extra motion on screen, so under reduced motion the
// camera stays locked on the Hero instead: the world scrolls at the Hero's
// own steady pace and stops the moment the Hero does.
export function followStep(current: number, target: number, delta: number, reducedMotion: boolean): number {
  if (reducedMotion) return target
  return MathUtils.damp(current, target, FOLLOW_SHARPNESS, delta)
}

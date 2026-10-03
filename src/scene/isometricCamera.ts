// A true isometric view puts the camera on the (1, 1, 1) diagonal, looking at
// the origin: 45° around the vertical axis and ~35.264° above the ground.
// Combined with an OrthographicCamera (no perspective), all three world axes
// appear equally foreshortened, which is what gives the "isometric" look.
export function isometricCameraPosition(distance: number): [number, number, number] {
  const d = distance / Math.sqrt(3)
  return [d, d, d]
}

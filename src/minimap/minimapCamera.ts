import { MathUtils, OrthographicCamera, Vector3 } from 'three'
import type { GroundPosition } from '../run/movement'
import { GROUND_SIZE } from '../scene/Ground'
import { MINIMAP_LAYER } from '../scene/layers'

// The minimap's on-screen square, in CSS pixels. The scene draws into this
// region of the canvas and the DOM frame sits exactly on top of it, so both
// read these numbers.
export const MINIMAP_SIZE = 200
export const MINIMAP_MARGIN = 16

const HALF = GROUND_SIZE / 2

// An OrthographicCamera's view volume is a box: left/right/top/bottom are
// its sides in world units, measured from the camera. Making the box exactly
// the ground's size means the whole map fills the square minimap, and since
// there is no perspective, a Tower at the map's edge is drawn the same size
// as one in the middle: distances on the minimap are true to the map.
export const minimapCamera = new OrthographicCamera(-HALF, HALF, HALF, -HALF, 0.1, 100)
// Straight above the map centre, looking down. lookAt aims the camera's -Z
// axis at the target; `up` then decides how the picture is turned around
// that axis. Pointing it at world -x puts the Nexus corner (-x -z) at the
// top right and the Base corner at the bottom left: the main view's
// diamond, turned 45° into a square.
minimapCamera.position.set(0, 50, 0)
minimapCamera.up.set(-1, 0, 0)
minimapCamera.lookAt(0, 0, 0)
minimapCamera.layers.enable(MINIMAP_LAYER)
// The camera is never added to the scene, so nothing else updates its world
// matrix; unproject below needs it.
minimapCamera.updateMatrixWorld()

const point = new Vector3()

// Turns a spot on the minimap into a ground position. `u` runs 0..1 from the
// minimap's left edge to its right, `v` 0..1 from its top edge to its bottom
// (the way the DOM measures). Points past the edge are clamped onto it.
export function minimapToWorld(u: number, v: number): GroundPosition {
  // Normalised device coordinates (NDC): the camera's view mapped to a cube
  // from -1 to 1 on each axis, with +y up. unproject runs the camera's
  // matrices backwards, from NDC to world space. For an orthographic camera
  // the depth (z) only moves the point along the vertical view ray, which
  // does not change the x and z we keep.
  point.set(MathUtils.clamp(u, 0, 1) * 2 - 1, 1 - MathUtils.clamp(v, 0, 1) * 2, 0).unproject(minimapCamera)
  return { x: point.x, z: point.z }
}

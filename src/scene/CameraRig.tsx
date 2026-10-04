import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect } from 'react'
import { useDisplayProfile } from '../display/displayProfile'
import { runStore } from '../run/runStore'
import { CAMERA_OFFSET, followStep, zoomAfterWheel } from './isometricCamera'

const [offsetX, , offsetZ] = CAMERA_OFFSET
// Wheel deltas come in pixels, or in lines (Firefox); one line ≈ 16 px.
const PIXELS_PER_LINE = 16

// Follows the Hero and handles wheel zoom. Renders nothing; it only drives
// R3F's default camera.
export function CameraRig() {
  const camera = useThree((state) => state.camera)
  const canvas = useThree((state) => state.gl.domElement)
  const { reducedMotion } = useDisplayProfile()

  // Start already framing the Hero at the Base instead of gliding in from
  // the origin, where the camera was first aimed.
  useLayoutEffect(() => {
    const { heroPosition } = runStore.getState()
    camera.position.x = heroPosition.x + offsetX
    camera.position.z = heroPosition.z + offsetZ
  }, [camera])

  useFrame((_, delta) => {
    const { heroPosition } = runStore.getState()
    // The camera was aimed at the origin once, at startup, and we never call
    // lookAt again: we only translate it. Moving the camera and the point it
    // looks at by the same amount keeps the isometric angle fixed, so
    // "follow" is just "keep the same offset from the Hero".
    camera.position.x = followStep(camera.position.x, heroPosition.x + offsetX, delta, reducedMotion)
    camera.position.z = followStep(camera.position.z, heroPosition.z + offsetZ, delta, reducedMotion)
  })

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      // Stop the page from scrolling along with the zoom.
      event.preventDefault()
      // An OrthographicCamera has no distance to move along; `zoom` scales
      // its view box instead. Any change to zoom, fov, near/far or the box
      // must be followed by updateProjectionMatrix(), the matrix the GPU
      // actually uses to project 3D points onto the screen.
      const deltaY = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * PIXELS_PER_LINE : event.deltaY
      camera.zoom = zoomAfterWheel(camera.zoom, deltaY)
      camera.updateProjectionMatrix()
    }
    // passive: false is required for preventDefault() to work on wheel.
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [camera, canvas])

  return null
}

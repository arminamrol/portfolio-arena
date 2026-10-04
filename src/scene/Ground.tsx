import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect } from 'react'
import { GROUND_SIZE } from '../map/mapLayout'
import { runStore } from '../run/runStore'
import { isMoveGesture } from './moveGesture'

export function Ground() {
  const canvas = useThree((state) => state.gl.domElement)

  // Right-click moves the Hero, so the browser's context menu must not open
  // anywhere on the canvas.
  useEffect(() => {
    function handleContextMenu(event: MouseEvent) {
      event.preventDefault()
    }
    canvas.addEventListener('contextmenu', handleContextMenu)
    return () => canvas.removeEventListener('contextmenu', handleContextMenu)
  }, [canvas])

  // R3F pointer events are raycasts under the hood. On every pointer event it
  // turns the mouse's pixel position into a ray shooting from the camera
  // through that point (Raycaster.setFromCamera), tests the ray against the
  // meshes that have handlers, and calls the handler of each mesh hit,
  // nearest first. `event.point` is the exact world-space spot the ray hit.
  // A tap on a phone arrives as the same pointerdown, raycast the same way.
  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    if (!isMoveGesture(event)) return
    runStore.getState().setMoveTarget({ x: event.point.x, z: event.point.z })
  }

  return (
    // A Mesh is an Object3D (it has a transform) that pairs a geometry (vertex
    // data on the GPU) with a material (how its surface reacts to light).
    // PlaneGeometry is built in the XY plane, but Three.js is Y-up, so we tip
    // it -90° around X to lay it flat as a floor.
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={handlePointerDown}>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      {/* MeshStandardMaterial is physically based: it needs lights, otherwise
          it renders black. roughness 1 = fully matte, no shiny highlight. */}
      <meshStandardMaterial color="#5b7f4a" roughness={1} />
    </mesh>
  )
}

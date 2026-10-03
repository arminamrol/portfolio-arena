import { Canvas } from '@react-three/fiber'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { AbilityEffects } from './AbilityEffects'
import { CameraRig } from './CameraRig'
import { Ground } from './Ground'
import { Hero } from './Hero'
import { Lanes } from './Lanes'
import { Base, Nexus, Shop } from './Landmarks'
import { Lights } from './Lights'
import { MoveTargetMarker } from './MoveTargetMarker'
import { Towers } from './Towers'
import { CAMERA_OFFSET } from './isometricCamera'

const layout = mapLayout(resumeData)

export function Scene() {
  return (
    // <Canvas> creates the three core Three.js objects for us:
    // - WebGLRenderer: owns the <canvas> and the WebGL context, draws frames.
    // - Scene: the root of the scene graph. Every JSX element below becomes
    //   a child Object3D; child transforms are relative to their parent.
    // - Camera: here an OrthographicCamera (see `orthographic` below).
    // It also runs the render loop (requestAnimationFrame -> render) and
    // watches the container size: on resize it calls renderer.setSize and
    // updates the camera's projection, so the image never stretches.
    <Canvas
      // devicePixelRatio clamped to [1, 2]: retina screens can be 3x, which
      // means 9x the pixels to shade for little visible gain.
      dpr={[1, 2]}
      // "percentage" = PCFShadowMap: filtered shadow edges. (The soft variant
      // was removed from recent Three.js releases.)
      shadows="percentage"
      // OrthographicCamera: a box-shaped view volume with no perspective,
      // so parallel lines stay parallel. R3F sizes its frustum to the canvas
      // in pixels, and `zoom` sets how many pixels one world unit covers.
      orthographic
      // Cameras look down their own -Z axis. R3F calls camera.lookAt(0, 0, 0)
      // on its default camera (unless you pass a rotation), so the Hero at
      // the origin is framed in the centre.
      camera={{ position: CAMERA_OFFSET, zoom: 40, near: 0.1, far: 100 }}
    >
      <color attach="background" args={['#1d2330']} />
      <Lights />
      <Ground />
      <Lanes lanes={layout.lanes} />
      <Base position={layout.base} />
      <Shop position={layout.shop} />
      <Nexus position={layout.nexus} />
      <Towers lanes={layout.lanes} />
      <MoveTargetMarker />
      <Hero />
      <AbilityEffects />
      <CameraRig />
    </Canvas>
  )
}

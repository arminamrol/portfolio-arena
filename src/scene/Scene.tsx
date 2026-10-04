import { Canvas } from '@react-three/fiber'
import { mapLayout } from '../map/mapLayout'
import { resumeData } from '../resume/resumeData'
import { AbilityEffects } from './AbilityEffects'
import { CameraRig } from './CameraRig'
import { Ground } from './Ground'
import { Fog, FOG_COLOR } from './Fog'
import { Hero } from './Hero'
import { Lanes } from './Lanes'
import { Base, Nexus, Shop } from './Landmarks'
import { Lights } from './Lights'
import { MinimapView } from './MinimapView'
import { MoveTargetMarker } from './MoveTargetMarker'
import { Scenery } from './Scenery'
import { Towers } from './Towers'
import { CAMERA_OFFSET } from './isometricCamera'

const layout = mapLayout(resumeData)

// Scene fog's linear ramp, in world units of distance from the camera: no
// haze nearer than HAZE_NEAR, full FOG_COLOR at HAZE_FAR. The camera sits
// 30 units from the Hero, so the ground around the Hero stays clear and
// only the far (upper) part of the screen fades a little.
const HAZE_NEAR = 34
const HAZE_FAR = 90

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
      // devicePixelRatio clamped to [1, 2]. The canvas's drawing buffer is
      // its CSS size times this ratio, and every one of those pixels runs
      // the fragment shaders each frame. Many phones are 3x: capping at 2
      // shades 4/9 of the pixels, a big saving on a small GPU for a
      // difference hard to see on a small screen.
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
      <color attach="background" args={[FOG_COLOR]} />
      {/* Scene fog (Three.js's Fog class, not our Fog of war below): every
          material with fog enabled, the built-in ones by default, blends
          its colour toward the fog colour by its distance from the camera.
          It is computed per pixel in the material's own shader, so it costs
          next to nothing. Linear Fog ramps between near and far; FogExp2
          thickens exponentially instead. Matching the background makes
          the far side of the map melt into the void around it. */}
      <fog attach="fog" args={[FOG_COLOR, HAZE_NEAR, HAZE_FAR]} />
      <Lights />
      <Ground />
      <Lanes lanes={layout.lanes} />
      <Scenery layout={layout} />
      <Base position={layout.base} />
      <Shop position={layout.shop} />
      <Nexus position={layout.nexus} />
      <Towers lanes={layout.lanes} />
      <MoveTargetMarker />
      <Hero />
      {/* After the Hero: useFrame callbacks run in mount order, so the Fog
          uploads the ground the Hero revealed this frame, not last frame. */}
      <Fog />
      <AbilityEffects />
      <CameraRig />
      <MinimapView layout={layout} />
    </Canvas>
  )
}

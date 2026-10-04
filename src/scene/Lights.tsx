import { useDisplayProfile } from '../display/displayProfile'
import { GROUND_SIZE } from '../map/mapLayout'

// Half the side of the shadow camera's box. The sun looks at the map from
// an angle, so the square ground is a skewed shape in its view; the box must
// reach the map's corners (half the diagonal), not just its sides.
const SHADOW_EXTENT = (GROUND_SIZE / 2) * Math.SQRT2

// Shadow map resolution: 2048² on a desktop, a quarter of the texels on a
// phone, whose GPU pays for every one of them each frame.
const SHADOW_MAP_SIZE = 2048
const SMALL_SCREEN_SHADOW_MAP_SIZE = 1024

export function Lights() {
  const { smallScreen } = useDisplayProfile()
  const shadowMapSize = smallScreen ? SMALL_SCREEN_SHADOW_MAP_SIZE : SHADOW_MAP_SIZE

  return (
    <>
      {/* AmbientLight lifts every surface equally: no direction, no shadows.
          It keeps the faces turned away from the sun from going pure black. */}
      <ambientLight intensity={0.6} />
      {/* DirectionalLight is a sun: parallel rays shining from its position
          toward its target (the origin by default). To cast shadows it renders
          a depth map from its own orthographic shadow camera, whose box must
          cover the area where shadows should appear.
          A shadow map is a depth texture: from the light's point of view,
          how far away the nearest surface is at each texel. When drawing
          the scene, each pixel checks whether something sits between it
          and the light at that spot; if so, it is in shadow. Only meshes
          with castShadow are drawn into the map, and only meshes with
          receiveShadow do the check. mapSize is the texture's resolution:
          2048² spread over the whole map gives the small models crisp
          enough shadows for one extra depth pass per frame. */}
      {/* The shadow map texture is created at the first render that needs
          it, at the size set then; changing mapSize later does not resize
          it. Keyed by the size, so a change remounts the light and a new
          map is made at the new size. */}
      <directionalLight
        key={shadowMapSize}
        position={[8, 15, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        // A surface compared against its own stored depth can shadow itself
        // in stripes ("shadow acne"), from the map's limited precision.
        // normalBias pushes the lookup out along the surface normal, past
        // that rounding, without detaching shadows from their casters.
        shadow-normalBias={0.03}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
      />
    </>
  )
}

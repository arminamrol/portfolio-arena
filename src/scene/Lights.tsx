import { GROUND_SIZE } from './Ground'

const SHADOW_EXTENT = GROUND_SIZE / 2

export function Lights() {
  return (
    <>
      {/* AmbientLight lifts every surface equally: no direction, no shadows.
          It keeps the faces turned away from the sun from going pure black. */}
      <ambientLight intensity={0.6} />
      {/* DirectionalLight is a sun: parallel rays shining from its position
          toward its target (the origin by default). To cast shadows it renders
          a depth map from its own orthographic shadow camera, whose box must
          cover the area where shadows should appear. */}
      <directionalLight
        position={[8, 15, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
      />
    </>
  )
}

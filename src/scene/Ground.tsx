export const GROUND_SIZE = 40

export function Ground() {
  return (
    // A Mesh is an Object3D (it has a transform) that pairs a geometry (vertex
    // data on the GPU) with a material (how its surface reacts to light).
    // PlaneGeometry is built in the XY plane, but Three.js is Y-up, so we tip
    // it -90° around X to lay it flat as a floor.
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      {/* MeshStandardMaterial is physically based: it needs lights, otherwise
          it renders black. roughness 1 = fully matte, no shiny highlight. */}
      <meshStandardMaterial color="#5b7f4a" roughness={1} />
    </mesh>
  )
}

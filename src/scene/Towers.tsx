import { ConeGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'
import type { LaneLayout } from '../map/mapLayout'

const SHAFT_HEIGHT = 2.6
const ROOF_HEIGHT = 1.2

// Shared by every Tower: adding a Resume Entry adds a mesh, not new GPU
// buffers or shader programs (see Lanes.tsx).
const shaftGeometry = new CylinderGeometry(0.55, 0.7, SHAFT_HEIGHT, 8)
const roofGeometry = new ConeGeometry(0.9, ROOF_HEIGHT, 8)
const shaftMaterial = new MeshStandardMaterial({ color: '#c9c2b2' })
const roofMaterial = new MeshStandardMaterial({ color: '#5a7bb5' })

// Placeholder Towers until the art pass, one per Resume Entry, standing
// where the map layout put them.
export function Towers({ lanes }: { lanes: LaneLayout[] }) {
  return (
    <>
      {lanes.flatMap((lane) =>
        lane.towers.map((tower) => (
          // Each Tower is a group: placing the group places both parts, and
          // the parts' positions below are relative to the Tower's foot.
          <group key={tower.entryId} position={[tower.position.x, 0, tower.position.z]}>
            {/* Cylinders and cones are centred on their origin, so lift each
                by half its height to stack them. */}
            <mesh geometry={shaftGeometry} material={shaftMaterial} position={[0, SHAFT_HEIGHT / 2, 0]} castShadow receiveShadow />
            <mesh
              geometry={roofGeometry}
              material={roofMaterial}
              position={[0, SHAFT_HEIGHT + ROOF_HEIGHT / 2, 0]}
              castShadow
            />
          </group>
        )),
      )}
    </>
  )
}

import { useMemo } from 'react'
import type { MapLayout } from '../map/mapLayout'
import { sceneryLayout, type SceneryKind, type SceneryItem } from '../map/scenery'
import { useRevealed } from '../run/runStore'
import { Model } from './Model'

// Height of each kind of item at scale 1, in world units.
const HEIGHTS: Record<SceneryKind, number> = {
  tree: 1.8,
  treeLarge: 2.6,
  rocks: 0.6,
  rocksLarge: 1,
}

// Trees and rocks dressing the map. Each is a clone of a loaded model, so
// they share geometry and material: many meshes, one set of GPU buffers.
export function Scenery({ layout }: { layout: MapLayout }) {
  const items = useMemo(() => sceneryLayout(layout), [layout])
  return (
    <>
      {items.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </>
  )
}

function Item({ item }: { item: SceneryItem }) {
  // Hidden until revealed: it would stick up through the Fog (see Towers).
  const revealed = useRevealed(item.position)
  return (
    <group position={[item.position.x, 0, item.position.z]} rotation={[0, item.rotation, 0]} visible={revealed}>
      <Model name={item.kind} size={{ height: HEIGHTS[item.kind] * item.scale }} />
    </group>
  )
}

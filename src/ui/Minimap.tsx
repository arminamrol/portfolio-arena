import { useRef, type PointerEvent } from 'react'
import { useDisplayProfile } from '../display/displayProfile'
import { minimapPlacement, minimapToWorld } from '../minimap/minimapCamera'
import { runStore } from '../run/runStore'
import './Minimap.css'

const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2

// The frame over the minimap, bottom right. The picture inside is drawn by
// the scene (see scene/MinimapView.tsx) into the same square of the canvas;
// this element only adds the border and turns clicks into move targets.
// Being on top of the canvas, it also stops clicks there from reaching the
// ground underneath.
export function Minimap() {
  // True between a press on the minimap and its release, so dragging keeps
  // steering the Hero.
  const steering = useRef(false)
  const { size, margin, corner } = minimapPlacement(useDisplayProfile())

  function moveHeroTo(event: PointerEvent<HTMLDivElement>) {
    // From pixels on the page to 0..1 across the minimap, then to the world.
    const rect = event.currentTarget.getBoundingClientRect()
    const u = (event.clientX - rect.left) / rect.width
    const v = (event.clientY - rect.top) / rect.height
    runStore.getState().setMoveTarget(minimapToWorld(u, v))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    // Left or right click; the middle button is left to the browser. A tap
    // arrives as button 0, so it steers like a left click.
    if (event.button !== LEFT_BUTTON && event.button !== RIGHT_BUTTON) return
    // Only the first finger steers, as on the ground (see moveGesture.ts).
    if (!event.isPrimary) return
    steering.current = true
    // Keep receiving moves (and the release) even if the drag leaves the
    // frame; minimapToWorld clamps those to the map's edge.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    moveHeroTo(event)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (steering.current && event.isPrimary) moveHeroTo(event)
  }

  function stopSteering() {
    steering.current = false
  }

  return (
    <div
      className="minimap"
      // A pointer-only shortcut: keyboard users steer in the main view, so
      // it is labelled for screen readers but not focusable.
      role="img"
      aria-label="Minimap: click or tap to move the Hero there"
      style={{ width: size, height: size, right: margin, [corner]: margin }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopSteering}
      onPointerCancel={stopSteering}
      // Right-click moves the Hero, as in the main view, so no menu.
      onContextMenu={(event) => event.preventDefault()}
    />
  )
}

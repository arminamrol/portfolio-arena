import { useEffect, useLayoutEffect, useRef } from 'react'
import { resumeData } from '../resume/resumeData'
import { runStore, useRunStore } from '../run/runStore'
import './InventoryPanel.css'

// The Ability bar's Inventory button controls this panel; the ids tie the
// two together for aria-controls and for handing focus back and forth.
export const INVENTORY_PANEL_ID = 'inventory-panel'
export const INVENTORY_BUTTON_ID = 'inventory-button'

// The panel listing every Tool in the Inventory, grouped by area. Plain DOM
// over the canvas, like the Shop, so screen readers read it and Tab reaches it.
export function InventoryPanel() {
  const inventoryOpen = useRunStore((state) => state.inventoryOpen)

  // Esc closes one panel at a time, the Inventory first: the visitor opened
  // it on purpose, and on a small screen it sits on top of the others.
  // Listening in the capture phase runs this before the Info Panel's (bubble
  // phase) listener; listening from mount, not only while open, registers it
  // before the Shop's capture listener, which is added only when the Shop
  // opens. preventDefault tells the others that this Esc is used up.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || !runStore.getState().inventoryOpen) return
      event.preventDefault()
      runStore.getState().closeInventory()
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  return inventoryOpen ? <OpenInventoryPanel /> : null
}

function OpenInventoryPanel() {
  const panelRef = useRef<HTMLElement>(null)

  // The Inventory only opens from its button, so it always takes focus when
  // the button has it (see ShopPanel), and hands it back on close.
  useLayoutEffect(() => {
    const panel = panelRef.current
    const inventoryButton = document.getElementById(INVENTORY_BUTTON_ID)
    if (panel && document.activeElement === inventoryButton) panel.focus()
    return () => {
      if (panel?.contains(document.activeElement)) inventoryButton?.focus()
    }
  }, [])

  return (
    <aside
      id={INVENTORY_PANEL_ID}
      ref={panelRef}
      className="inventory-panel"
      aria-labelledby="inventory-panel-title"
      tabIndex={-1}
    >
      <button
        type="button"
        className="inventory-panel__close"
        aria-label="Close Inventory"
        onClick={() => runStore.getState().closeInventory()}
      >
        ×
      </button>
      <h2 id="inventory-panel-title" className="inventory-panel__title">
        Inventory
      </h2>
      {resumeData.inventory.map((group, index) => {
        const labelId = `inventory-group-${index}`
        return (
          <section key={group.label} className="inventory-panel__group">
            <h3 id={labelId} className="inventory-panel__group-title">
              {group.label}
            </h3>
            <ul className="inventory-panel__tools" aria-labelledby={labelId}>
              {group.tools.map((tool) => (
                <li key={tool} className="inventory-tool">
                  {tool}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </aside>
  )
}

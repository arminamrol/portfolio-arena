import { useEffect, useLayoutEffect, useRef, type AnchorHTMLAttributes } from 'react'
import { resumeData } from '../resume/resumeData'
import type { ContactLink } from '../resume/types'
import { runStore, useRunStore } from '../run/runStore'
import './ShopPanel.css'

// The HUD's Shop button controls this panel; the ids tie the two together
// for aria-controls and for handing focus back and forth.
export const SHOP_PANEL_ID = 'shop-panel'
export const SHOP_BUTTON_ID = 'shop-button'

// The panel listing every Contact Link as a Shop Item. Plain DOM over the
// canvas, like the Info Panel, so screen readers read it and Tab reaches it.
export function ShopPanel() {
  const shopOpen = useRunStore((state) => state.shopOpen)

  useEffect(() => {
    if (!shopOpen) return
    // Esc closes one panel at a time, the Shop first. Listening in the
    // capture phase runs this before the Info Panel's (bubble phase)
    // listener whatever the mount order; preventDefault tells it that this
    // Esc is used up.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      runStore.getState().closeShop()
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [shopOpen])

  // A polite live region that is always present, so screen readers announce
  // the panel when walking up to the Shop opens it (see InfoPanel).
  return <div aria-live="polite">{shopOpen && <OpenShopPanel />}</div>
}

function OpenShopPanel() {
  const panelRef = useRef<HTMLElement>(null)

  // Focus follows the visitor's intent. Opened with the HUD button (so the
  // button has focus), the panel takes focus so the keyboard user lands in
  // it. Opened by walking up to the Shop, it leaves focus alone. On close,
  // if focus was inside the panel, it goes back to the button rather than
  // being dropped on <body>. A layout effect, so its cleanup runs while the
  // panel is still in the DOM and can still be asked what it contains.
  useLayoutEffect(() => {
    const panel = panelRef.current
    const shopButton = document.getElementById(SHOP_BUTTON_ID)
    if (panel && document.activeElement === shopButton) panel.focus()
    return () => {
      if (panel?.contains(document.activeElement)) shopButton?.focus()
    }
  }, [])

  return (
    <aside id={SHOP_PANEL_ID} ref={panelRef} className="shop-panel" aria-labelledby="shop-panel-title" tabIndex={-1}>
      <button
        type="button"
        className="shop-panel__close"
        aria-label="Close Shop"
        onClick={() => runStore.getState().closeShop()}
      >
        ×
      </button>
      <h2 id="shop-panel-title" className="shop-panel__title">
        Shop
      </h2>
      <p className="shop-panel__subtitle">Everything here is free. Take what you need.</p>
      <ul className="shop-panel__items">
        {resumeData.contactLinks.map((contactLink) => (
          <li key={contactLink.url}>
            <ShopItem contactLink={contactLink} />
          </li>
        ))}
      </ul>
    </aside>
  )
}

function ShopItem({ contactLink }: { contactLink: ContactLink }) {
  const kind = contactLinkKind(contactLink.url)
  return (
    <a className="shop-item" href={contactLink.url} {...CONTACT_LINK_ATTRIBUTES[kind]}>
      <span className="shop-item__label">{contactLink.label}</span>
      <span className="shop-item__hint">{CONTACT_LINK_HINTS[kind]}</span>
      <span className="shop-item__price" aria-hidden="true">
        0 gold
      </span>
    </a>
  )
}

type ContactLinkKind = 'web' | 'email' | 'download'

// What following a Contact Link does, read from its URL, so the Resume Data
// stays a plain list of labels and URLs.
function contactLinkKind(url: string): ContactLinkKind {
  if (url.startsWith('mailto:')) return 'email'
  if (url.toLowerCase().endsWith('.pdf')) return 'download'
  return 'web'
}

const CONTACT_LINK_ATTRIBUTES: Record<ContactLinkKind, AnchorHTMLAttributes<HTMLAnchorElement>> = {
  web: { target: '_blank', rel: 'noreferrer' },
  // The browser hands mailto: to the mail client; a new tab would only
  // leave an empty tab behind.
  email: {},
  download: { download: true },
}

const CONTACT_LINK_HINTS: Record<ContactLinkKind, string> = {
  web: 'Opens in a new tab',
  email: 'Opens your mail client',
  download: 'Downloads a PDF',
}

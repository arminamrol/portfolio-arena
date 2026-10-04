import type { AnchorHTMLAttributes } from 'react'

type ContactLinkKind = 'web' | 'email' | 'download'

// The anchor attributes for a Contact Link, so following it does the right
// thing wherever it is shown (the Shop, the Victory screen).
export function contactLinkAttributes(url: string): AnchorHTMLAttributes<HTMLAnchorElement> {
  return CONTACT_LINK_ATTRIBUTES[contactLinkKind(url)]
}

// A short note on what following a Contact Link does.
export function contactLinkHint(url: string): string {
  return CONTACT_LINK_HINTS[contactLinkKind(url)]
}

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

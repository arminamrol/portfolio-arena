import { describe, expect, it } from 'vitest'

// Everything that ships to the browser, read as text the same way the
// originality test does. The resume leaves out the owner's phone number, and
// the placeholder resume must be gone entirely.
const shipped = import.meta.glob<string>(['/src/**/*', '/public/**/*', '/index.html', '!/src/privacy.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
// An Iranian mobile number, with or without the country code and separators.
const PHONE_NUMBER = /(?:\+98|0098|\b0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/
const PLACEHOLDER = /sam rivera|example\.com|github\.com\/example\b/i

describe('privacy', () => {
  it('finds files to check', () => {
    expect(Object.keys(shipped).length).toBeGreaterThan(50)
  })

  it.each(Object.entries(shipped))('%s leaves out the phone number and the placeholder resume', (_, content) => {
    expect(content).not.toMatch(PHONE_NUMBER)
    expect(content).not.toMatch(PLACEHOLDER)
  })

  it('ships no resume PDF', () => {
    expect(Object.keys(shipped).filter((path) => path.endsWith('.pdf'))).toEqual([])
  })
})

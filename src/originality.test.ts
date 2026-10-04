import { describe, expect, it } from 'vitest'

// Everything that ships to the browser: code, styles, models, textures, the
// page itself, read through Vite as text. Model files decode to mostly
// garbage, but the names embedded in them (nodes, materials, animation
// clips) are plain ASCII and survive, so they are searched too.
const shipped = import.meta.glob<string>(['/src/**/*', '/public/**/*', '/index.html', '!/src/originality.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const BANNED = /dota|valve|defense of the ancients/i

describe('originality', () => {
  it('finds files to check', () => {
    expect(Object.keys(shipped).length).toBeGreaterThan(50)
  })

  it.each(Object.entries(shipped))('%s names no other game or its maker', (path, content) => {
    expect(path).not.toMatch(BANNED)
    expect(content).not.toMatch(BANNED)
  })
})

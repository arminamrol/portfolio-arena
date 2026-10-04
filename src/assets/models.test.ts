import { describe, expect, it } from 'vitest'
import { MODEL_BUDGET_BYTES, MODELS } from './models'

// Every file under public/models/, read through Vite as a base64 data URL
// (`?inline`), keyed by its path from the project root. Needs `.glb` in the
// Vite config's assetsInclude, so Vite treats models as assets.
const shipped = import.meta.glob<string>('/public/models/**/*', { query: '?inline', import: 'default', eager: true })

function bytes(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return (base64.length * 3) / 4 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
}

function text(dataUrl: string) {
  return atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
}

describe('models', () => {
  const models = Object.entries(MODELS)

  it.each(models)('%s points at a model file that exists', (_, model) => {
    expect(shipped[`/public/${model.url}`]).toBeDefined()
  })

  it.each(models)('%s is CC0, with its source recorded', (_, model) => {
    expect(model.licence).toBe('CC0 1.0')
    expect(model.source).toMatch(/^https:\/\//)
  })

  it.each(models)('%s ships next to the licence file of the kit it came from', (_, model) => {
    const kit = model.url.slice(0, model.url.lastIndexOf('/'))
    const licence = shipped[`/public/${kit}/License.txt`]
    expect(licence).toBeDefined()
    expect(text(licence)).toContain('Creative Commons Zero, CC0')
  })

  it('keeps every model and texture together under the budget', () => {
    const total = Object.values(shipped).reduce((sum, file) => sum + bytes(file), 0)
    expect(total).toBeGreaterThan(0)
    expect(total).toBeLessThan(MODEL_BUDGET_BYTES)
  })

  it('leaves room in the 5 MB initial load for the code', () => {
    expect(MODEL_BUDGET_BYTES).toBeLessThanOrEqual(2 * 1024 * 1024)
  })
})

// Every model the world draws, with where it came from. All are CC0 (public
// domain) low-poly models by Kenney; each kit's own License.txt is shipped
// next to its files in public/models/<kit>/.
//
// The .glb files reference their kit's texture atlas by a relative URI
// (Textures/colormap.png), so each kit keeps its folder layout and every
// model of a kit shares one small texture download.

export type ModelCredit = {
  // Path under public/, as the browser requests it.
  url: string
  author: string
  licence: 'CC0 1.0'
  // Page the kit was downloaded from.
  source: string
}

const TOWER_DEFENSE_KIT = 'https://kenney.nl/assets/tower-defense-kit'
const FANTASY_TOWN_KIT = 'https://kenney.nl/assets/fantasy-town-kit'
const MINI_DUNGEON = 'https://kenney.nl/assets/mini-dungeon'

function kenney(url: string, source: string): ModelCredit {
  return { url, author: 'Kenney', licence: 'CC0 1.0', source }
}

export const MODELS = {
  // Rigged, with idle and walk animation clips.
  hero: kenney('models/mini-dungeon/character-human.glb', MINI_DUNGEON),
  tower: kenney('models/tower-defense-kit/tower-round-build-c.glb', TOWER_DEFENSE_KIT),
  // The round pad the Base and the Nexus stand on.
  pad: kenney('models/tower-defense-kit/spawn-round.glb', TOWER_DEFENSE_KIT),
  nexus: kenney('models/tower-defense-kit/detail-crystal-large.glb', TOWER_DEFENSE_KIT),
  shop: kenney('models/fantasy-town-kit/stall-red.glb', FANTASY_TOWN_KIT),
  tree: kenney('models/tower-defense-kit/detail-tree.glb', TOWER_DEFENSE_KIT),
  treeLarge: kenney('models/tower-defense-kit/detail-tree-large.glb', TOWER_DEFENSE_KIT),
  rocks: kenney('models/tower-defense-kit/detail-rocks.glb', TOWER_DEFENSE_KIT),
  rocksLarge: kenney('models/tower-defense-kit/detail-rocks-large.glb', TOWER_DEFENSE_KIT),
} satisfies Record<string, ModelCredit>

export type ModelName = keyof typeof MODELS

// The most all model files and textures together may weigh. The initial
// load must stay under 5 MB; this keeps well over half of that for the code
// (three and React Three Fiber are most of it).
export const MODEL_BUDGET_BYTES = 2 * 1024 * 1024

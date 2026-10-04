import { Layers } from 'three'

// Every Object3D has a Layers bitmask (32 layers; everything starts on layer
// 0) and so does every camera. A camera draws an object only if their masks
// share a layer. The minimap camera sees layers 0 and 1, the main camera
// layers 0 and 2, so icons on layer 1 show on the minimap and nowhere else.
// Raycasts test layer 0 only, so the icons never catch ground clicks.
export const MINIMAP_LAYER = 1
// And the other way round: things on layer 2 show in the main view only
// (the main camera enables it), like Lane labels, too small to read here.
export const MAIN_VIEW_LAYER = 2
// R3F copies a Layers object's mask onto an element's `layers` prop.
export const minimapOnlyLayers = new Layers()
minimapOnlyLayers.set(MINIMAP_LAYER)
export const mainViewOnlyLayers = new Layers()
mainViewOnlyLayers.set(MAIN_VIEW_LAYER)

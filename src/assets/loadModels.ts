import { Box3, Cache, LoadingManager, Mesh, Vector3, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { assetStore } from './assetStore'
import { MODELS, type ModelName } from './models'

// Three.js's own in-memory file cache, off by default. Every model of a kit
// asks for the same Textures/colormap.png; with the cache on, the first
// request is shared (even while still in flight) instead of one per model.
Cache.enabled = true

const models = new Map<ModelName, GLTF>()
let loading: Promise<void> | null = null

// Loads every model once, reporting progress to the asset store. Safe to
// call again (StrictMode runs effects twice): later calls get the same
// promise.
export function loadModels(): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    // A LoadingManager counts the files its loaders fetch. Each loader calls
    // manager.itemStart(url) when a request starts and itemEnd(url) when it
    // finishes; the manager turns that into onProgress(url, loaded, total)
    // and, once loaded === total, onLoad. Files a model pulls in while being
    // parsed (its texture) are started before the model itself ends, so
    // onLoad only fires when the textures are in too.
    const manager = new LoadingManager()
    manager.onProgress = (_, itemsLoaded, itemsTotal) => assetStore.getState().progressed(itemsLoaded, itemsTotal)
    // onLoad fires even after a failure (a failed file still counts as
    // finished), in which case the promise is already rejected and the
    // store ignores it.
    manager.onLoad = () => {
      assetStore.getState().loaded()
      resolve()
    }
    manager.onError = (url) => {
      assetStore.getState().failed()
      reject(new Error(`Could not load ${url}`))
    }

    // GLTFLoader reads glTF, the "JPEG of 3D": a JSON scene description
    // (nodes, meshes, materials, animations) plus binary vertex buffers.
    // A .glb packs both into one binary file. load() fetches it, then parses
    // it into ready-made Three.js objects: `gltf.scene` is a Group holding
    // Meshes with BufferGeometry and MeshStandardMaterial, and
    // `gltf.animations` holds AnimationClips. Relative URIs inside the file
    // (our textures) are resolved against the .glb's own folder.
    const loader = new GLTFLoader(manager)
    for (const [name, model] of Object.entries(MODELS) as [ModelName, (typeof MODELS)[ModelName]][]) {
      // BASE_URL: where public/ ends up once deployed, "/" in development.
      loader.load(`${import.meta.env.BASE_URL}${model.url}`, (gltf) => {
        // Every mesh casts a shadow onto others and receives theirs. Both
        // are off by default, per mesh, because each costs a draw in the
        // shadow pass.
        gltf.scene.traverse((object) => {
          if (object instanceof Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })
        models.set(name, gltf)
      })
    }
  })
  return loading
}

// A loaded model. Only call once the asset store says 'ready'.
export function getModel(name: ModelName): GLTF {
  const gltf = models.get(name)
  if (!gltf) throw new Error(`Model "${name}" has not loaded`)
  return gltf
}

const box = new Box3()
const measured = new Vector3()

// How big to make a model: its height, or its width along x.
export type ModelSize = { height: number } | { width: number }

// A fresh copy of a model's scene, scaled to `size` and standing on y = 0.
// clone() copies the Object3D tree but shares the geometry and materials,
// so ten Towers still use one set of GPU buffers. (Not for the Hero: a
// skinned mesh's clone would still point at the original's bones.)
export function modelInstance(name: ModelName, size: ModelSize): Object3D {
  const instance = getModel(name).scene.clone()
  fitToSize(instance, size)
  return instance
}

// Kits are modelled at their own scale, so measure instead of guessing. A
// Box3 is an axis-aligned bounding box; setFromObject grows it around every
// vertex of the object and its children, in world space.
export function fitToSize(object: Object3D, size: ModelSize) {
  object.scale.setScalar(1)
  object.position.set(0, 0, 0)
  object.updateMatrixWorld(true)
  box.setFromObject(object).getSize(measured)
  const scale = 'height' in size ? size.height / measured.y : size.width / measured.x
  object.scale.setScalar(scale)
  // Lift (or lower) it so its lowest point touches the ground.
  object.position.y = -box.min.y * scale
}

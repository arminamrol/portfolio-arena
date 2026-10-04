import { useState } from 'react'
import { modelInstance, type ModelSize } from '../assets/loadModels'
import type { ModelName } from '../assets/models'

// A copy of a loaded model, made once when this element mounts.
export function Model({ name, size }: { name: ModelName; size: ModelSize }) {
  const [model] = useState(() => modelInstance(name, size))
  // <primitive> mounts an existing Object3D instead of creating one.
  return <primitive object={model} />
}

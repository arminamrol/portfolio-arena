// Whether this browser can give the game a WebGL context. Asks a throwaway
// canvas, the same way the renderer will; locked-down machines and some
// remote desktops have WebGL switched off, and the game cannot run there.
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

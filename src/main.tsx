import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { isWebGLAvailable } from './webgl'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App webglAvailable={isWebGLAvailable()} />
  </StrictMode>,
)

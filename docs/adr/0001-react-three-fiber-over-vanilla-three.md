# React + TypeScript with React Three Fiber, not vanilla Three.js

The original spec called for vanilla JavaScript with plain Three.js. The owner is a senior React developer whose goal is to learn Three.js, so the app is React + TypeScript and the 3D scene uses React Three Fiber (R3F), whose JSX maps one-to-one onto Three.js classes. drei and other helper libraries are excluded at first: each Three.js concept (render loop, cameras, raycasting, loaders) is written by hand before a helper may replace it, so R3F never hides the concept being learned.

## Considered Options

- **Vanilla Three.js inside one React component (`useEffect`)**: teaches the raw API most directly, but splits the codebase into two paradigms and fights React for state.
- **R3F + drei from day one**: fastest, but drei hides most of the concepts this project exists to teach.

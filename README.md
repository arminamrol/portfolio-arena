# Portfolio Arena

My resume as a small isometric arena game. You steer a Hero around the map and capture Towers, and each Tower shows one job, project or degree.

## What it is

- **Towers**: each one holds one entry from the resume. Walk into its range to capture it and open its details.
- **Abilities**: press Q, W, E or R to play an effect and see one of my headline skills.
- **Inventory**: the full list of tools I work with, grouped by area.
- **Shop**: near the start, it "sells" my contact links and resume PDF.
- **Fog**: the map starts dark and clears as you explore.
- **Plain Resume**: a normal, scrollable HTML version of the same resume. You can switch to it at any time, and it opens on its own when the browser has no WebGL.

Controls: right-click to move with a mouse, or tap on a touch screen.

## Tech stack

React 19, TypeScript, [React Three Fiber](https://r3f.docs.pmnd.rs/) over Three.js, Zustand, Vite and Vitest.

## Running it locally

```bash
pnpm install
pnpm dev        # start the dev server
pnpm test       # run the tests
pnpm typecheck  # type-check without building
pnpm build      # production build into dist/
```

## Reading the code

- [`CONTEXT.md`](CONTEXT.md) is the glossary. It defines the words the code uses (Tower, Lane, Capture, Run and so on).
- [`docs/adr/`](docs/adr/) records the decisions that would look odd without context, such as why it uses React Three Fiber without drei.
- [`src/resume/resumeData.ts`](src/resume/resumeData.ts) holds all the resume content. The map, Towers, Abilities, Inventory and Shop are all generated from it.

## Making your own

Fork it, replace the content of `src/resume/resumeData.ts` with your own resume, and deploy the output of `pnpm build` to any static host. The types in `src/resume/types.ts` tell you what each field needs.

Please don't deploy my resume as your own. See the license below.

## License

The code is under the [MIT License](LICENSE). The resume content in `src/resume/resumeData.ts` is **not**: it is my personal information, all rights reserved. The reason is in [ADR 0002](docs/adr/0002-resume-content-excluded-from-mit.md).

## Credits

The 3D models and textures come from [Kenney](https://kenney.nl/) (Tower Defense Kit, Fantasy Town Kit, Mini Dungeon), released under CC0.

## Contributing

Bug reports and ideas are welcome as [issues](https://github.com/arminamrol/portfolio-arena/issues). This is a personal site, so I don't accept pull requests.

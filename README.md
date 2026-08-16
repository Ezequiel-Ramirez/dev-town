# Dev Town — 16-bit developer portfolio

A personal landing page shaped like a top-down 16-bit game. Visitors walk a
character around a neighborhood and enter six buildings; each one opens an RPG
dialog with a section of the portfolio and real links out (email, GitHub,
LinkedIn, CV).

No backend, no database, no tracking. It is a static site.

## The town

| Building   | Section         |
| ---------- | --------------- |
| HOME       | About me        |
| WORKSHOP   | Stack & skills  |
| ARCADE     | Projects        |
| OFFICE     | Experience      |
| POST       | Contact links   |
| NEWS       | Résumé download |

## Edit your content

Everything a visitor reads lives in one file:

```
src/content/portfolio.config.ts
```

Replace the `TODO:` placeholders (name, email, GitHub, LinkedIn, projects,
experience) and you are done — the map, the signs and the accessible text
version all read from it. The `sign` field is what gets painted on the building,
so keep it under ~11 characters.

### Static files (CV, images)

They go in `public/` **at the project root**, next to `package.json` — not
inside `src/`. Vite copies that folder to the root of the build, so
`public/cv.pdf` is served as `/cv.pdf`:

```
Landing-personal/
├── public/
│   └── cv.pdf      ->  https://your-site.com/cv.pdf
├── src/
└── package.json
```

A file under `src/` is never served: the dev server falls back to `index.html`,
which is why a wrong path looks like a redirect to the home page.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

## Deploy

The output is a static `dist/` folder, so any static host works with zero
configuration. On Vercel or Netlify: import the repo, framework preset **Vite**,
build command `npm run build`, output directory `dist`.

## How it works

There are no image assets. Every sprite is a matrix of characters mapped to a
palette, and every tile is drawn with rectangle fills on a canvas — that is what
keeps it crisp at any zoom and the bundle tiny.

```
src/
  content/portfolio.config.ts   your data — the only file you need to touch
  game/
    domain/                     tiles, world map, collision, buildings
    art/                        palette, sprite matrices, pixel helpers
    engine/                     input, player, camera, sound
    render/                     terrain, buildings, scene composition
    Game.ts                     game loop + the state React subscribes to
  ui/
    hooks/                      React bridge to the engine
    components/                 start screen, HUD, dialog, touch controls
```

The engine is framework-agnostic: it owns the loop and the canvas, and exposes an
immutable snapshot through `subscribe` / `getSnapshot`, which React consumes with
`useSyncExternalStore`. React never drives a frame.

## Accessibility and SEO

The full portfolio is always present in the DOM as semantic HTML
(`TextMode.tsx`). Hidden it serves screen readers and search engine crawlers;
the **TXT** button in the HUD makes it visible for anyone who does not want to
play. Motion respects `prefers-reduced-motion`, and sound is off until the
visitor starts the game.

## Controls

- Arrows / WASD — move
- Shift — run
- Space — jump (purely for fun; it does nothing in the game)
- Escape or Space — close an open dialog
- E or Enter — reopen the door you are standing on

Sections open **on arrival**: walking up to a door is the interaction, no key
press needed. A door you just closed will not reopen until you step away from
it. On touch devices an on-screen D-pad and A (jump) button appear
automatically.

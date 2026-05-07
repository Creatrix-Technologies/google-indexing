## Cursor Cloud specific instructions

This is a **Vue 3 + TypeScript + Vite** frontend SPA (`google-tools-ui`) for GoogleIndexing.com. The backend (.NET API) lives in a separate repository.

### Running the app

- `npm run dev` — starts Vite dev server on `http://localhost:5173`
- `npm run build` — runs `vue-tsc -b && vite build` (type-check + production build)
- `npm run preview` — serves the production build locally

### Key facts

- **Package manager**: npm (lockfile: `package-lock.json`)
- **No ESLint/Prettier config** — no lint command exists in `package.json`
- **No test framework** — no test runner or test files in the repo
- **No git hooks** — no `.husky/`, `.pre-commit-config.yaml`, or `lint-staged`
- **Type checking** serves as the primary code quality gate: `npx vue-tsc -b`
- The Vite config drops `console` and `debugger` statements via `esbuild.drop` in production builds; dev server preserves them
- `.env` points the API at `http://localhost:5161` (the .NET backend, not in this repo)
- All authenticated routes require the backend API; public/marketing pages render without it

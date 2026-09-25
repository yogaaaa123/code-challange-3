# Audit Notes

Notes taken while auditing the todo app before fixing it, and what each fix
changed. One commit per issue (see `git log --oneline`).

## Security

| Issue | Impact | Fix |
| --- | --- | --- |
| Hardcoded API key `sk-...` in the component, plus `console.log` of the key and of every todo on each render | The secret ships in the bundle to every visitor and leaks through the console | Key removed (a real key belongs in the environment), debug logging deleted |
| `dangerouslySetInnerHTML={{ __html: todo.text }}` | Stored XSS: a todo like `<img src=x onerror=...>` executes in every browser that renders it | Todo text is rendered as text; verified by mutation (re-adding `dangerouslySetInnerHTML` fails the tests) |
| `JSON.parse(localStorage.getItem('todos'))` without checks | Corrupt or hand-edited storage throws and can inject unexpected shapes into state | Parsing moved into `loadTodos` with a shape check, id normalisation and a safe `[]` fallback |

## Performance

| Issue | Impact | Fix |
| --- | --- | --- |
| Filtering, counting and the `stats` object rebuilt every render | Work repeated on every keystroke | `useMemo` for `visibleTodos` and `stats` |
| Handlers re-created every render and updaters reading `todos` from the closure | Blocked `memo` on the rows, so every row re-rendered on any state change | `useCallback` handlers + functional `setState` updates |
| Every row rendered inline inside `App` | Any change re-rendered all rows | `TodoItem` extracted and wrapped in `memo` |
| `useEffect` writing to storage with no dependency array | Wrote on every render, including input-only renders | Effect depends on `todos` only |

Measured with a temporary render counter (2 todos, 3 keystrokes in the
input): 0 row re-renders after the fix, versus 6 before it (each keystroke
re-rendered every row).

## Code quality

- Todo creation, filtering and stats were mixed into the component: moved to
  `src/utils/todo.js`; storage access to `src/utils/storage.js`.
- `Date.now()` was the todo id, so two todos added in the same millisecond
  collided. Now `crypto.randomUUID()` with a timestamp+random fallback.
- No error boundary: a render error blanked the page. Added
  `src/components/ErrorBoundary.jsx`, used in `main.jsx`.
- Storage read/write could throw (private mode, quota): both now report the
  failure and keep the app working.

## Accessibility

- Input had no label (placeholder only). Added a visually hidden `<label>`.
- Checkboxes and delete buttons were announced identically for every row, and
  the checkbox was unlabelled. Added per-todo `aria-label`s.
- Filter buttons did not expose which filter was active: added
  `aria-pressed` and grouped them under `aria-label="Filter todos"`.
- Plain `div`s used for the list: now a real `<ul>`/`<li>` list.
- Stats line: now a `role="status"` region so changes are announced.
- Empty list and empty filter result had no text: added an empty state.
- Added `:focus-visible` outlines for keyboard users.
- Colour contrast: an axe-core 4.10.2 audit (WCAG 2.1 A/AA) reported one
  serious violation with six nodes (the add button, the filter buttons, the
  completed row text and the delete button inside a completed row). Buttons now
  use #0069d9 and #1e7e34, and completed rows use a grey text colour instead of
  `opacity: 0.6`, which was dimming everything inside the row.
  `src/index.contrast.test.js` computes the ratios from `index.css` so a later
  colour change cannot silently drop below 4.5:1. Re-injecting the original
  palette into the page makes the same audit report those six nodes again, and
  with the current stylesheet it reports no violations (21 rules pass).

## Developer experience

- `onKeyPress` is deprecated: replaced with `onKeyDown` through named handlers.
- Empty input triggered a blocking `alert()`: replaced with an inline error
  message linked via `aria-describedby` / `aria-invalid`; input is trimmed.
- Inline styles on the filter bar while the rest of the page is styled in
  `index.css`: moved to `.filters` / `.filter-btn` classes.
- `pnpm install` / `pnpm test` failed with `ERR_PNPM_IGNORED_BUILDS` because
  `pnpm-workspace.yaml` still held the setup placeholder: esbuild is now
  approved in both the pnpm 11 (`allowBuilds`) and pnpm 10
  (`onlyBuiltDependencies`) spellings.
- `vite.config.js` used Vite's `defineConfig` with a `test` block that Vite
  silently ignores: switched to `vitest/config`.
- No tests covered the logic: unit tests for `utils/todo.js` and
  `utils/storage.js`, plus behaviour tests for filtering, input handling,
  accessibility, empty state, persistence and XSS safety.

## Deliberately unchanged

- No new features and no rewrite: same markup structure, texts, styling and
  behaviour (add / toggle / delete / filter / stats / localStorage).
- The `todos` localStorage key and stored todo shape stay backward compatible.
- Cross-tab synchronisation (`storage` events) and server-side sanitisation
  were out of scope: the app is client-only and no HTML is ever produced.

## How this was verified

- `pnpm test` (66 tests) and `pnpm build` pass, including from a fresh clone
  with `pnpm install --frozen-lockfile` on pnpm 10 and pnpm 11.
- Mutation checks: restoring `dangerouslySetInnerHTML` fails the two security
  tests; making the row handlers unstable brings back 6 row re-renders for 3
  keystrokes (measured with a temporary render counter, 0 with the fix).
- Real browser (Firefox, dev server and production preview): add, toggle,
  delete, filter, empty state, inline validation, reload persistence, hostile
  text rendered inert, unique UUID ids, no console errors. The error boundary
  was exercised by temporarily throwing from a row: fallback shown, app stayed
  mounted, and clearing storage plus "Try again" recovered the app.
- axe-core 4.10.2 (WCAG 2.1 A/AA) reports no violations, 21 rules pass, with
  Dark Reader disabled so the browser reports the real colours. This browser did
  have Dark Reader enabled during the first audit, so the ratios are also
  checked numerically by `src/index.contrast.test.js`.
- Not verifiable here: live-region announcements with a real screen reader, and
  pnpm 9, which needs a `packages:` field in `pnpm-workspace.yaml`.

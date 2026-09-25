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

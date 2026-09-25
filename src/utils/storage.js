const STORAGE_KEY = 'todos'

// Anything read back from localStorage is untrusted input: it may be corrupted,
// hand-edited, or written by an older version of the app.
function isValidTodo(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.text === 'string' &&
    typeof value.completed === 'boolean'
  )
}

export function loadTodos() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidTodo).map(({ id, text, completed, createdAt }) => ({
      id: String(id),
      text,
      completed,
      createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    }))
  } catch (error) {
    // Failing to restore history must not break the app.
    console.error('Could not read saved todos:', error)
    return []
  }
}

export function saveTodos(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    return true
  } catch (error) {
    // Storage can be full or disabled (private mode); keep the app usable.
    console.error('Could not save todos:', error)
    return false
  }
}

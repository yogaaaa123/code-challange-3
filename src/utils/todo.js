export const FILTERS = ['all', 'active', 'completed']

export const FILTER_LABELS = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
}

// crypto.randomUUID is available in every modern browser (and in Node), but the
// fallback keeps older environments working.
function createTodoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createTodo(text) {
  return {
    id: createTodoId(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

export function filterTodos(todos, filter) {
  if (filter === 'active') {
    return todos.filter(todo => !todo.completed)
  }
  if (filter === 'completed') {
    return todos.filter(todo => todo.completed)
  }
  return todos
}

export function getTodoStats(todos) {
  let completed = 0
  for (const todo of todos) {
    if (todo.completed) {
      completed += 1
    }
  }

  return { total: todos.length, completed, active: todos.length - completed }
}

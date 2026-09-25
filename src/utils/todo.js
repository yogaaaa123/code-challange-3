export function createTodo(text) {
  return {
    id: Date.now(),
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

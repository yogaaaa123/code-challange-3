import { useState, useEffect, useCallback, useMemo } from 'react'
import TodoItem from './components/TodoItem'
import { loadTodos, saveTodos } from './utils/storage'
import { FILTERS, FILTER_LABELS, createTodo, filterTodos, getTodoStats } from './utils/todo'

function App() {
  // Reading storage in the initializer means the first render already shows the
  // saved todos, so no effect has to restore them.
  const [todos, setTodos] = useState(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [validationError, setValidationError] = useState('')

  // Persist only when the list actually changes.
  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback(() => {
    const text = input.trim()

    if (text === '') {
      // A blocking alert() is not announced as a field error; an inline
      // message is both visible and read out by assistive technology.
      setValidationError('Please enter a todo')
      return
    }

    // Functional updates keep this callback independent of the current todos.
    setTodos(previousTodos => [...previousTodos, createTodo(text)])
    setInput('')
    setValidationError('')
  }, [input])

  const handleInputChange = useCallback((event) => {
    setInput(event.target.value)
    setValidationError('')
  }, [])

  // onKeyPress is deprecated and never fires for every key on some keyboards.
  const handleInputKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      addTodo()
    }
  }, [addTodo])

  const deleteTodo = useCallback((id) => {
    setTodos(previousTodos => previousTodos.filter(todo => todo.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(previousTodos => previousTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }, [])

  // Filtering and counting walk the whole list, and both only change when the
  // todos or the filter do, so they are recomputed only when that happens.
  const visibleTodos = useMemo(() => filterTodos(todos, filter), [todos, filter])
  const stats = useMemo(() => getTodoStats(todos), [todos])

  // One shared handler reads the target filter from the button itself, so the
  // buttons below do not need a new arrow function on every render.
  const handleFilterChange = useCallback((event) => {
    setFilter(event.currentTarget.dataset.filter)
  }, [])

  return (
    <div className="app">
      <h1>My Todo List</h1>

      <div className="input-section">
        {/* A real label keeps the field accessible to screen readers */}
        <label className="visually-hidden" htmlFor="new-todo">
          New todo
        </label>
        <input
          id="new-todo"
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="What needs to be done?"
          aria-invalid={validationError !== ''}
          aria-describedby={validationError ? 'new-todo-error' : undefined}
        />
        <button type="button" onClick={addTodo}>Add</button>
      </div>

      {validationError !== '' && (
        <p className="validation-error" id="new-todo-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="filters" role="group" aria-label="Filter todos">
        {FILTERS.map(value => (
          <button
            key={value}
            type="button"
            data-filter={value}
            className={filter === value ? 'filter-btn filter-btn--active' : 'filter-btn'}
            onClick={handleFilterChange}
            aria-pressed={filter === value}
          >
            {FILTER_LABELS[value]}
          </button>
        ))}
      </div>

      {visibleTodos.length === 0 ? (
        <p className="empty-state">
          {todos.length === 0
            ? 'No todos yet. Add your first task above.'
            : `No ${FILTER_LABELS[filter].toLowerCase()} todos.`}
        </p>
      ) : (
        // A real list lets screen readers announce the number of items
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            // Stable, unique keys keep React from reusing the wrong row
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}

      {/* role="status" announces stats changes politely */}
      <div className="stats" role="status">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
    </div>
  )
}

export default App

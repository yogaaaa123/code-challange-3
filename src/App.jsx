import { useState, useEffect } from 'react'
import TodoItem from './components/TodoItem'
import { loadTodos, saveTodos } from './utils/storage'
import { FILTERS, FILTER_LABELS, createTodo, filterTodos, getTodoStats } from './utils/todo'

function App() {
  // Reading storage in the initializer means the first render already shows the
  // saved todos, so no effect has to restore them.
  const [todos, setTodos] = useState(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')

  // Persist only when the list actually changes.
  useEffect(() => {
    saveTodos(todos)
  }, [todos])
  
  // Issue 5: Function yang tidak di-memoize, re-create setiap render
  const addTodo = () => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }

    setTodos([...todos, createTodo(input)])
    setInput('')
  }

  const handleInputChange = (event) => {
    setInput(event.target.value)
  }

  // onKeyPress is deprecated and never fires for every key on some keyboards.
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      addTodo()
    }
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const visibleTodos = filterTodos(todos, filter)
  const stats = getTodoStats(todos)

  // One shared handler reads the target filter from the button itself, so the
  // buttons below do not need a new arrow function on every render.
  const handleFilterChange = (event) => {
    setFilter(event.currentTarget.dataset.filter)
  }

  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="What needs to be done?"
        />
        <button type="button" onClick={addTodo}>Add</button>
      </div>
      
      <div className="filters">
        {FILTERS.map(value => (
          <button
            key={value}
            type="button"
            data-filter={value}
            className={filter === value ? 'filter-btn filter-btn--active' : 'filter-btn'}
            onClick={handleFilterChange}
          >
            {FILTER_LABELS[value]}
          </button>
        ))}
      </div>
      
      <div className="todo-list">
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {visibleTodos.map((todo) => (
          // Stable, unique keys keep React from reusing the wrong row
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </div>
      
      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
    </div>
  )
}

export default App

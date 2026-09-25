import { useState, useEffect } from 'react'
import TodoItem from './components/TodoItem'
import { loadTodos, saveTodos } from './utils/storage'
import { createTodo, filterTodos, getTodoStats } from './utils/todo'

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

  // Issue 10: Inline event handler dengan arrow function (re-create setiap render)
  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      {/* Issue 11: Tidak ada label untuk accessibility */}
      <div className="input-section">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo()
            }
          }}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      {/* Issue 12: Inline styles (inconsistent dengan CSS file) */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{ background: filter === 'all' ? '#28a745' : '#007bff' }}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          style={{ background: filter === 'active' ? '#28a745' : '#007bff' }}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          style={{ background: filter === 'completed' ? '#28a745' : '#007bff' }}
        >
          Completed
        </button>
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

import { memo } from 'react'

// memo keeps unchanged rows from re-rendering when another todo changes.
function TodoItem({ todo, onToggle, onDelete }) {
  const { id, text, completed } = todo

  return (
    <div className={`todo-item${completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        aria-label={`Mark "${text}" as ${completed ? 'active' : 'completed'}`}
      />
      <span>{text}</span>
      <button
        type="button"
        className="delete-btn"
        onClick={() => onDelete(id)}
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </div>
  )
}

export default memo(TodoItem)

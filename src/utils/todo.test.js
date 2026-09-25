import { describe, it, expect, vi, afterEach } from 'vitest'
import { createTodo, filterTodos, getTodoStats } from './todo'

describe('createTodo', () => {
  it('builds a todo with the expected shape', () => {
    const todo = createTodo('Buy milk')

    expect(todo.text).toBe('Buy milk')
    expect(todo.completed).toBe(false)
    expect(new Date(todo.createdAt).toString()).not.toBe('Invalid Date')
  })

  it('never reuses an id', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createTodo('x').id))

    expect(ids.size).toBe(1000)
  })

  it('still generates ids when crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', { ...globalThis.crypto, randomUUID: undefined })

    const first = createTodo('x').id
    const second = createTodo('x').id

    expect(typeof first).toBe('string')
    expect(first).not.toBe(second)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
})

describe('filterTodos', () => {
  const todos = [
    { id: 'a', text: 'active', completed: false },
    { id: 'b', text: 'done', completed: true },
  ]

  it('returns every todo for the all filter', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(2)
  })

  it('returns only unfinished todos for the active filter', () => {
    expect(filterTodos(todos, 'active')).toEqual([todos[0]])
  })

  it('returns only finished todos for the completed filter', () => {
    expect(filterTodos(todos, 'completed')).toEqual([todos[1]])
  })

  it('falls back to every todo for an unknown filter', () => {
    expect(filterTodos(todos, 'unknown')).toHaveLength(2)
  })
})

describe('getTodoStats', () => {
  it('counts total, active and completed todos', () => {
    const stats = getTodoStats([
      { id: 'a', text: 'one', completed: false },
      { id: 'b', text: 'two', completed: true },
      { id: 'c', text: 'three', completed: true },
    ])

    expect(stats).toEqual({ total: 3, active: 1, completed: 2 })
  })

  it('handles an empty list', () => {
    expect(getTodoStats([])).toEqual({ total: 0, active: 0, completed: 0 })
  })
})

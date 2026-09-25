import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadTodos, saveTodos } from './storage'

describe('loadTodos', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadTodos()).toEqual([])
  })

  it('restores a valid stored list', () => {
    localStorage.setItem(
      'todos',
      JSON.stringify([
        { id: 'a', text: 'Buy milk', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
      ]),
    )

    expect(loadTodos()).toEqual([
      { id: 'a', text: 'Buy milk', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
    ])
  })

  it('normalises ids to strings', () => {
    localStorage.setItem('todos', JSON.stringify([{ id: 123, text: 'Old todo', completed: true }]))

    expect(loadTodos()[0].id).toBe('123')
  })

  it('discards entries that do not look like todos', () => {
    localStorage.setItem(
      'todos',
      JSON.stringify([
        { id: 'ok', text: 'Valid', completed: false },
        null,
        'not a todo',
        { id: 'x', text: 42, completed: false },
        { id: 'y' },
      ]),
    )

    const todos = loadTodos()

    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('Valid')
  })

  it('survives corrupt JSON', () => {
    localStorage.setItem('todos', '{not json')

    expect(loadTodos()).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('survives stored values that are not a list', () => {
    localStorage.setItem('todos', JSON.stringify({ text: 'nope' }))

    expect(loadTodos()).toEqual([])
  })
})

describe('saveTodos', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes the list as JSON', () => {
    const todos = [{ id: 'a', text: 'Buy milk', completed: false }]

    expect(saveTodos(todos)).toBe(true)
    expect(JSON.parse(localStorage.getItem('todos'))).toEqual(todos)
  })

  it('reports failure instead of throwing when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(saveTodos([{ id: 'a', text: 'Buy milk', completed: false }])).toBe(false)
    expect(console.error).toHaveBeenCalled()
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { loadTodos } from './utils/storage'

describe('legacy stored data', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('can toggle and delete todos saved by the previous version', () => {
    // Shape written by the original app: numeric id, no createdAt.
    localStorage.setItem(
      'todos',
      JSON.stringify([
        { id: 1790303143593, text: 'Legacy one', completed: false, createdAt: '2026-09-25T02:25:43.593Z' },
        { id: 1790303143597, text: 'Legacy two', completed: false },
      ]),
    )

    render(<App />)
    const [first] = screen.getAllByRole('checkbox')

    fireEvent.click(first)
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
    expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked()

    // The untouched row must keep its identity (no cross-talk between rows).
    expect(screen.getByText('Legacy two')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('Delete')[0])
    expect(screen.queryByText('Legacy one')).not.toBeInTheDocument()
    expect(screen.getByText('Legacy two')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem('todos'))
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Legacy two')
  })

  it('never throws on hostile stored payloads', () => {
    const payloads = [
      '',
      'null',
      'undefined',
      '[]',
      '{}',
      '"a string"',
      '42',
      '[1, 2, 3]',
      '[{"id": {}, "text": [], "completed": "yes"}]',
      '[null]',
      '[[["deep"]]]',
      JSON.stringify(new Array(50).fill({ id: 'a', text: 'x', completed: false })),
    ]

    for (const payload of payloads) {
      localStorage.setItem('todos', payload)
      const todos = loadTodos()
      expect(Array.isArray(todos)).toBe(true)
      for (const todo of todos) {
        expect(typeof todo.id).toBe('string')
        expect(typeof todo.text).toBe('string')
        expect(typeof todo.completed).toBe('boolean')
      }
    }

    const rendered = payloads.map(payload => {
      localStorage.setItem('todos', payload)
      return render(<App />).container.innerHTML.length
    })
    expect(rendered.every(length => length > 0)).toBe(true)
  })
})

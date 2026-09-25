import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

function addTodo(text) {
  const input = screen.getByPlaceholderText('What needs to be done?')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByText('Add'))
}

describe('security regressions', () => {
  beforeEach(() => {
    localStorage.clear()
    delete window.__xss
  })

  it('renders todo text as text, never as markup', () => {
    render(<App />)
    const payload = '<img src=x onerror="window.__xss = true">'

    addTodo(payload)

    expect(screen.getByText(payload)).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
    expect(window.__xss).toBeUndefined()
  })

  it('keeps malicious text inert after a reload', () => {
    const { unmount } = render(<App />)
    addTodo('<script>window.__xss = true</script>')
    unmount()

    render(<App />)

    expect(screen.getByText('<script>window.__xss = true</script>')).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
    expect(window.__xss).toBeUndefined()
  })
})

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restores the stored todos on start', () => {
    localStorage.setItem(
      'todos',
      JSON.stringify([{ id: 'a', text: 'Saved earlier', completed: true, createdAt: '2024-01-01T00:00:00.000Z' }]),
    )

    render(<App />)

    expect(screen.getByText('Saved earlier')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('writes changes back to storage', () => {
    render(<App />)
    addTodo('Buy milk')

    const stored = JSON.parse(localStorage.getItem('todos'))
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ text: 'Buy milk', completed: false })

    fireEvent.click(screen.getByRole('checkbox'))
    expect(JSON.parse(localStorage.getItem('todos'))[0].completed).toBe(true)

    fireEvent.click(screen.getByText('Delete'))
    expect(JSON.parse(localStorage.getItem('todos'))).toEqual([])
  })

  it('ignores corrupt stored data instead of crashing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('todos', '{not json')

    render(<App />)

    expect(screen.getByText('My Todo List')).toBeInTheDocument()
    expect(screen.getByText(/No todos yet/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('keeps working when storage cannot be written', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    render(<App />)
    addTodo('Still visible')

    expect(screen.getByText('Still visible')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

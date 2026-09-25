import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('StrictMode', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('adds one todo per click and keeps storage consistent', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'Strict one' } })
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('todos'))).toHaveLength(1)

    fireEvent.change(input, { target: { value: 'Strict two' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(JSON.parse(localStorage.getItem('todos')).filter(t => t.completed)).toHaveLength(1)

    fireEvent.click(screen.getAllByText('Delete')[1])
    expect(JSON.parse(localStorage.getItem('todos'))).toHaveLength(1)
  })

  it('does not lose stored todos when the effects run twice', () => {
    localStorage.setItem(
      'todos',
      JSON.stringify([{ id: 'a', text: 'Kept', completed: false, createdAt: '2024-01-01T00:00:00.000Z' }]),
    )

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    expect(screen.getByText('Kept')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('todos'))).toHaveLength(1)
  })
})

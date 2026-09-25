import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

function addTodo(text) {
  const input = screen.getByPlaceholderText('What needs to be done?')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByText('Add'))
}

describe('empty state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('invites the user to add a first todo', () => {
    render(<App />)

    expect(screen.getByText('No todos yet. Add your first task above.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('explains when the active filter matches nothing', () => {
    render(<App />)
    addTodo('Buy milk')

    fireEvent.click(screen.getByRole('button', { name: 'Completed' }))

    expect(screen.getByText('No completed todos.')).toBeInTheDocument()
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })

  it('explains when the completed filter matches nothing', () => {
    render(<App />)
    addTodo('Buy milk')

    fireEvent.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByText('No active todos.')).toBeInTheDocument()
  })

  it('replaces the empty state as soon as a todo exists', () => {
    render(<App />)
    addTodo('Buy milk')

    expect(screen.queryByText(/No todos yet/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

function addTodo(text) {
  const input = screen.getByPlaceholderText('What needs to be done?')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByText('Add'))
}

describe('accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exposes a labelled text field and an add button', () => {
    render(<App />)

    expect(screen.getByLabelText('New todo')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('gives every todo control a useful accessible name', () => {
    render(<App />)
    addTodo('Buy milk')

    expect(screen.getByRole('checkbox', { name: 'Mark "Buy milk" as completed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete "Buy milk"' })).toBeInTheDocument()
  })

  it('announces the active filter with aria-pressed', () => {
    render(<App />)

    const allFilter = screen.getByRole('button', { name: 'All' })
    const activeFilter = screen.getByRole('button', { name: 'Active' })

    expect(allFilter).toHaveAttribute('aria-pressed', 'true')
    expect(activeFilter).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(activeFilter)

    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('groups the filter buttons under a label', () => {
    render(<App />)

    expect(screen.getByRole('group', { name: 'Filter todos' })).toBeInTheDocument()
  })
})

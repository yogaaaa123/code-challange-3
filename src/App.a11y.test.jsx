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

  it('renders the todos as a list', () => {
    render(<App />)
    addTodo('Buy milk')
    addTodo('Walk the dog')

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('exposes the stats as a live status region', () => {
    render(<App />)
    addTodo('Buy milk')

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Total: 1')
    expect(status).toHaveTextContent('Active: 1')
  })
})

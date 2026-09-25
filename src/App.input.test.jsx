import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('input handling', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a todo when Enter is pressed', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')

    fireEvent.change(input, { target: { value: 'From keyboard' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('From keyboard')).toBeInTheDocument()
  })

  it('ignores other keys', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')

    fireEvent.change(input, { target: { value: 'Half typed' } })
    fireEvent.keyDown(input, { key: 'a' })

    expect(screen.queryByText('Half typed')).not.toBeInTheDocument()
  })

  it('shows an inline error instead of an alert for an empty todo', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a todo')
    expect(screen.getByLabelText('New todo')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('treats whitespace-only input as empty', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('clears the error once the user types', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')

    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Buy milk' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('New todo')).toHaveAttribute('aria-invalid', 'false')
  })

  it('trims the stored todo text', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')

    fireEvent.change(input, { target: { value: '  Buy milk  ' } })
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('todos'))[0].text).toBe('Buy milk')
  })
})

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
})

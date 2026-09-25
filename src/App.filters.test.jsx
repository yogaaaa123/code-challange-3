import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('filter buttons', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('filters the list by active, completed and all', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'Keep me' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(input, { target: { value: 'Finish me' } })
    fireEvent.click(screen.getByText('Add'))

    fireEvent.click(screen.getAllByRole('checkbox')[1])

    fireEvent.click(screen.getByText('Active'))
    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Finish me')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Completed'))
    expect(screen.queryByText('Keep me')).not.toBeInTheDocument()
    expect(screen.getByText('Finish me')).toBeInTheDocument()

    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.getByText('Finish me')).toBeInTheDocument()
  })
})

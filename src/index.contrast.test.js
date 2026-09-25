import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

// Vitest stubs CSS imports, so the stylesheet is read from disk. The suite is
// run from the project root (`pnpm test`).
const css = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf8')

const WHITE = '#ffffff'
const NAMED_COLOURS = { white: WHITE }

function declarationsFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))

  if (!match) {
    throw new Error(`No rule found for ${selector}`)
  }

  return match[1]
}

function colourOf(selector, property) {
  const match = declarationsFor(selector).match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))

  if (!match) {
    throw new Error(`${selector} has no ${property}`)
  }

  const value = match[1].trim().toLowerCase()
  const named = NAMED_COLOURS[value] ?? value

  // `#333` and `#333333` are the same colour; the maths needs six digits.
  return /^#[0-9a-f]{3}$/.test(named)
    ? `#${named[1].repeat(2)}${named[2].repeat(2)}${named[3].repeat(2)}`
    : named
}

function relativeLuminance(hex) {
  const channels = hex
    .replace('#', '')
    .match(/../g)
    .map(pair => parseInt(pair, 16) / 255)
    .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))

  const [red, green, blue] = channels
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG 2.1 AA needs 4.5:1 for normal text. Every pair below is text on the
// colour it is actually painted on (the card is white, the page is #f5f5f5).
const pairs = [
  ['heading', colourOf('h1', 'color'), WHITE],
  ['add button', colourOf('button', 'color'), colourOf('button', 'background')],
  ['add button hover', colourOf('button', 'color'), colourOf('button:hover', 'background')],
  ['filter button', WHITE, colourOf('.filter-btn', 'background')],
  ['active filter button', WHITE, colourOf('.filter-btn--active', 'background')],
  ['active filter button hover', WHITE, colourOf('.filter-btn--active:hover', 'background')],
  ['delete button', WHITE, colourOf('.delete-btn', 'background')],
  ['delete button hover', WHITE, colourOf('.delete-btn:hover', 'background')],
  ['todo text', colourOf('.todo-item span', 'color'), WHITE],
  ['completed todo text', colourOf('.todo-item.completed span', 'color'), WHITE],
  ['stats text', colourOf('.stats', 'color'), WHITE],
  ['empty state text', colourOf('.empty-state', 'color'), WHITE],
  ['validation error text', colourOf('.validation-error', 'color'), WHITE],
]

describe('colour contrast (WCAG 2.1 AA)', () => {
  it.each(pairs)('%s reaches 4.5:1', (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
  })

  it('does not dim completed rows with opacity, which breaks contrast', () => {
    expect(css).not.toMatch(/\.todo-item\.completed\s*\{[^}]*opacity/)
  })
})

import { describe, it, expect } from 'vitest'
import { createCharacter, createEnemy, calculateTotalStats } from '../utils/characterFactory'
import type { Position } from '../types/position'

describe('CharacterFactory', () => {
  it('should create a character with correct base stats', () => {
    const position: Position = { x: 0, y: 0 }
    const warrior = createCharacter(position, 'warrior')
    expect(warrior.stats.health).toBe(120)
    expect(warrior.stats.attack).toBe(12)
    expect(warrior.stats.defense).toBe(8)
  })

  it('should adjust stats based on level', () => {
    const position: Position = { x: 0, y: 0 }
    const warrior = createCharacter(position, 'warrior', 3)
    expect(warrior.stats.level).toBe(3)
    expect(warrior.stats.maxHealth).toBe(140) // 120 + (2 * 10)
    expect(warrior.stats.attack).toBe(16) // 12 + (2 * 2)
    expect(warrior.stats.defense).toBe(10) // 8 + (2 * 1)
  })

  it('should create enemy with random class', () => {
    const position: Position = { x: 0, y: 0 }
    const enemy = createEnemy(position, 1)
    expect(['warrior', 'mage', 'rogue']).toContain(enemy.class)
    expect(enemy.type).toBe('enemy')
  })

  it('should calculate total stats with bonuses', () => {
    const position: Position = { x: 0, y: 0 }
    const warrior = createCharacter(position, 'warrior')
    warrior.stats.bonuses.push({
      type: 'attack',
      value: 5
    })
    const totalStats = calculateTotalStats(warrior)
    expect(totalStats.attack).toBe(17) // 12 + 5
  })

  it('should handle multiple bonuses', () => {
    const position: Position = { x: 0, y: 0 }
    const warrior = createCharacter(position, 'warrior')
    warrior.stats.bonuses.push(
      { type: 'attack', value: 5 },
      { type: 'defense', value: 3 },
      { type: 'speed', value: 1 }
    )
    const totalStats = calculateTotalStats(warrior)
    expect(totalStats.attack).toBe(17) // 12 + 5
    expect(totalStats.defense).toBe(11) // 8 + 3
    expect(totalStats.speed).toBe(5) // 4 + 1
  })
})

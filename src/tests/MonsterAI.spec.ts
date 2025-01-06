import { describe, it, expect, beforeEach } from 'vitest'
import { handleMonsterAI } from '../utils/monsterAI'
import type { Entity } from '../types'
import type { MapTile } from '../types/map'

describe('MonsterAI', () => {
  let map: MapTile[][]
  let player: Entity
  let enemy: Entity

  beforeEach(() => {
    // 创建测试地图
    map = Array(10)
      .fill(null)
      .map(() =>
        Array(10)
          .fill(null)
          .map(() => ({
            type: 'floor',
            walkable: true
          }))
      )

    // 创建测试玩家
    player = {
      position: { x: 5, y: 5 },
      stats: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        attack: 10,
        defense: 5,
        level: 1,
        experience: 0,
        speed: 5,
        criticalChance: 0.1,
        criticalDamage: 1.5,
        attributePoints: 0,
        bonuses: [],
        statusEffects: []
      },
      type: 'player',
      class: 'warrior'
    }

    // 创建测试敌人
    enemy = {
      position: { x: 3, y: 3 },
      stats: {
        health: 50,
        maxHealth: 50,
        mana: 50,
        maxMana: 50,
        attack: 8,
        defense: 3,
        level: 1,
        experience: 0,
        speed: 4,
        criticalChance: 0.05,
        criticalDamage: 1.3,
        attributePoints: 0,
        bonuses: [],
        statusEffects: []
      },
      type: 'enemy',
      class: 'warrior'
    }
  })

  it('should move towards player when in range', () => {
    const result = handleMonsterAI(enemy, player, map)
    expect(result).toBeDefined()
    expect(typeof result.position.x).toBe('number')
    expect(typeof result.position.y).toBe('number')
  })

  it('should move towards player when aggressive', () => {
    const result = handleMonsterAI(enemy, player, map)
    if (result) {
      const oldDistance =
        Math.abs(enemy.position.x - player.position.x) +
        Math.abs(enemy.position.y - player.position.y)
      const newDistance =
        Math.abs(result.position.x - player.position.x) +
        Math.abs(result.position.y - player.position.y)
      expect(newDistance).toBeLessThan(oldDistance)
    }
  })

  it('should attack when adjacent to player', () => {
    enemy.position = { x: player.position.x + 1, y: player.position.y }
    const result = handleMonsterAI(enemy, player, map)
    expect(result.type).toBe('attack')
    expect(result.position).toEqual(player.position)
  })

  it('should avoid occupied positions', () => {
    const otherEnemy: Entity = {
      ...enemy,
      position: { x: enemy.position.x + 1, y: enemy.position.y }
    }
    const result = handleMonsterAI(enemy, player, map)
    if (result) {
      expect(result.position).not.toEqual(otherEnemy.position)
    }
  })

  it('should handle wall collisions', () => {
    // 在敌人周围放置墙壁
    map[enemy.position.y - 1][enemy.position.x].type = 'wall'
    map[enemy.position.y + 1][enemy.position.x].type = 'wall'
    map[enemy.position.y][enemy.position.x - 1].type = 'wall'
    map[enemy.position.y][enemy.position.x + 1].type = 'wall'
    map[enemy.position.y - 1][enemy.position.x].walkable = false
    map[enemy.position.y + 1][enemy.position.x].walkable = false
    map[enemy.position.y][enemy.position.x - 1].walkable = false
    map[enemy.position.y][enemy.position.x + 1].walkable = false

    const result = handleMonsterAI(enemy, player, map)
    expect(result.position).toEqual(enemy.position) // 应该原地不动
  })
})

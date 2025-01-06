import { describe, it, expect } from 'vitest'
import { useGameEngine } from '../composables/useGameEngine'
import type { Entity } from '../types/entity'
import type { Position } from '../types/position'
import type { MapTile } from '../types/map'

describe('GameEngine', () => {
  it('should initialize with default values', () => {
    const { gameState } = useGameEngine()

    expect(gameState.value.player).toBeDefined()
    expect(gameState.value.player.stats.health).toBe(120)
    expect(gameState.value.player.stats.maxHealth).toBe(120)
    expect(gameState.value.player.stats.level).toBe(1)
    expect(gameState.value.player.class).toBe(undefined)
    expect(gameState.value.score).toBe(0)
    expect(gameState.value.enemies).toEqual([])
    expect(gameState.value.map).toBeDefined()
    expect(gameState.value.turn).toBe(1)
    expect(gameState.value.isPlayerTurn).toBe(true)
    expect(gameState.value.gameStatus).toBe('playing')
  })

  it('should initialize game with map and player', async () => {
    const { gameState, initGame } = useGameEngine()
    await initGame('warrior')

    expect(gameState.value.map.length).toBeGreaterThan(0)
    expect(gameState.value.player.position).toBeDefined()
    expect(typeof gameState.value.player.position.x).toBe('number')
    expect(typeof gameState.value.player.position.y).toBe('number')
    expect(gameState.value.enemies.length).toBeGreaterThan(0)
  })

  it('should handle player movement and turn switching', async () => {
    const { gameState, initGame, movePlayer } = useGameEngine()
    await initGame('warrior')

    // 记录初始回合数和玩家回合状态
    const initialTurn = gameState.value.turn
    expect(gameState.value.isPlayerTurn).toBe(true)

    // 找到一个可移动的位置
    const player = gameState.value.player
    const validPosition: Position = {
      x: player.position.x + 1,
      y: player.position.y
    }

    // 确保目标位置是可行走的
    if (
      gameState.value.map[validPosition.y] &&
      gameState.value.map[validPosition.y][validPosition.x]
    ) {
      gameState.value.map[validPosition.y][validPosition.x] = {
        type: 'floor',
        walkable: true
      } as MapTile

      // 移动玩家
      movePlayer(validPosition)

      // 检查回合是否增加
      expect(gameState.value.turn).toBe(initialTurn + 1)
      // 检查是否切换到敌人回合
      expect(gameState.value.isPlayerTurn).toBe(false)

      // 等待敌人回合结束
      await new Promise(resolve => setTimeout(resolve, 100))

      // 检查是否回到玩家回合
      expect(gameState.value.isPlayerTurn).toBe(true)
    }
  })

  it('should prevent player movement during enemy turn', async () => {
    const { gameState, initGame, movePlayer } = useGameEngine()
    await initGame('warrior')

    const player = gameState.value.player
    const initialPosition = { ...player.position }

    // 设置为敌人回合
    gameState.value.isPlayerTurn = false

    // 尝试移动玩家
    const newPosition: Position = {
      x: initialPosition.x + 1,
      y: initialPosition.y
    }

    // 确保目标位置是可行走的
    if (gameState.value.map[newPosition.y] && gameState.value.map[newPosition.y][newPosition.x]) {
      gameState.value.map[newPosition.y][newPosition.x] = {
        type: 'floor',
        walkable: true
      } as MapTile

      // 移动应该失败
      const result = movePlayer(newPosition)
      expect(result).toBe(false)
      // 位置应该保持不变
      expect(player.position).toEqual(initialPosition)
    }
  })

  it('should handle combat and game over', async () => {
    const { gameState, initGame, movePlayer } = useGameEngine()
    await initGame('warrior')

    const player = gameState.value.player
    const strongEnemy: Entity = {
      type: 'enemy',
      position: {
        x: player.position.x + 1,
        y: player.position.y
      },
      stats: {
        health: 1000,
        maxHealth: 1000,
        mana: 100,
        maxMana: 100,
        attack: 1000,
        defense: 1000,
        level: 1,
        experience: 0,
        speed: 5,
        criticalChance: 0.1,
        criticalDamage: 1.5,
        attributePoints: 0,
        bonuses: [],
        statusEffects: []
      },
      skills: [],
      inventory: [],
      equipment: {
        weapon: undefined,
        armor: undefined,
        accessory: undefined
      }
    }

    // 添加测试敌人
    gameState.value.enemies = [strongEnemy]

    // 移动到敌人位置触发战斗
    movePlayer(strongEnemy.position)

    // 检查游戏是否结束
    expect(gameState.value.gameStatus).toBe('gameover')
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameEngine } from '../composables/useGameEngine'
import { generateMap } from '../utils/mapGenerator'

// Mock generateMap
vi.mock('../utils/mapGenerator', () => ({
  generateMap: vi.fn()
}))

describe('GameEngine', () => {
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks()

    // 模拟地图生成
    const mockMap = Array(15).fill(null).map(() =>
      Array(20).fill(null).map(() => ({
        type: 'floor',
        walkable: true
      }))
    )
    const mockRooms = [
      { x: 2, y: 5, width: 3, height: 6 },
      { x: 9, y: 7, width: 3, height: 4 }
    ]

      ; (generateMap as any).mockReturnValue({ map: mockMap, rooms: mockRooms })
  })

  describe('initGame', () => {
    it('should properly initialize game state', async () => {
      const { gameState, initGame } = useGameEngine()

      // 验证初始状态
      expect(gameState.map).toHaveLength(0)
      expect(gameState.enemies).toHaveLength(0)
      expect(gameState.player.position).toEqual({ x: 0, y: 0 })

      // 初始化游戏
      const success = await initGame('warrior')

      // 验证初始化成功
      expect(success).toBe(true)
      expect(generateMap).toHaveBeenCalledTimes(1)

      // 验证地图已正确生成
      expect(gameState.map).toHaveLength(15)
      expect(gameState.map[0]).toHaveLength(20)

      // 验证玩家位置已正确设置
      expect(gameState.player.position).toEqual({ x: 3, y: 8 }) // 第一个房间的中心
      expect(gameState.player.class).toBe('warrior')

      // 验证敌人已生成
      expect(gameState.enemies).toHaveLength(1)

      // 验证游戏状态
      expect(gameState.turn).toBe(1)
      expect(gameState.isPlayerTurn).toBe(true)
      expect(gameState.gameStatus).toBe('playing')
      expect(gameState.score).toBe(0)
    })

    it('should handle map generation failure', async () => {
      const { gameState, initGame } = useGameEngine()

        // 模拟地图生成失败
        ; (generateMap as any).mockReturnValue({ map: [], rooms: [] })

      // 初始化游戏
      const success = await initGame('warrior')

      // 验证初始化失败
      expect(success).toBe(false)
      expect(generateMap).toHaveBeenCalledTimes(1)

      // 验证状态未改变
      expect(gameState.map).toHaveLength(0)
      expect(gameState.enemies).toHaveLength(0)
    })

    it('should maintain state reactivity after initialization', async () => {
      const { gameState, initGame } = useGameEngine()

      // 初始化游戏
      await initGame('warrior')

      // 验证状态更新的响应性
      const initialPosition = { ...gameState.player.position }

      // 更新玩家位置
      gameState.player.position = { x: 5, y: 5 }

      // 验证位置已更新
      expect(gameState.player.position).not.toEqual(initialPosition)
      expect(gameState.player.position).toEqual({ x: 5, y: 5 })
    })

    it('should properly handle state updates', async () => {
      const { gameState, initGame } = useGameEngine()

      // 初始化游戏
      await initGame('warrior')

      // 记录初始状态
      const initialState = {
        mapSize: gameState.map.length,
        playerPos: { ...gameState.player.position },
        enemies: gameState.enemies.length
      }

      // 模拟多个状态更新
      gameState.turn++
      gameState.score += 10
      gameState.player.stats.health -= 20

      // 验证状态更新
      expect(gameState.turn).toBe(2)
      expect(gameState.score).toBe(10)
      expect(gameState.player.stats.health).toBe(100)

      // 验证其他状态保持不变
      expect(gameState.map.length).toBe(initialState.mapSize)
      expect(gameState.enemies.length).toBe(initialState.enemies)
    })
  })
})

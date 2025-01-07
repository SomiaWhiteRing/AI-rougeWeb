import { ref, reactive } from 'vue'
import type { UnwrapRef } from 'vue'
import type { CharacterClass } from '../types/entity'
import type { MapTile } from '../types/map'
import type { Entity } from '../types/entity'
import type { Position } from '../types/position'
import { generateMap } from '../utils/mapGenerator'
import { createEnemy } from '../utils/characterFactory'

export type GameStatus = 'playing' | 'victory' | 'gameover'

interface GameState {
  player: Entity
  enemies: Entity[]
  map: MapTile[][]
  turn: number
  isPlayerTurn: boolean
  gameStatus: GameStatus
  score: number
  messages: string[]
}

// 将状态提升到模块级别
const gameState = reactive<GameState>({
  player: {
    type: 'player',
    position: { x: 0, y: 0 },
    stats: {
      health: 120,
      maxHealth: 120,
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
    skills: [],
    inventory: [],
    equipment: {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    }
  },
  enemies: [],
  map: [],
  turn: 1,
  isPlayerTurn: true,
  gameStatus: 'playing',
  score: 0,
  messages: ['Welcome to the game!']
})

const hasSaveData = ref(false)

export function useGameEngine() {
  function loadGame(): boolean {
    const savedData = localStorage.getItem('gameState')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as GameState
        Object.assign(gameState, parsedData)
        return true
      } catch (e) {
        console.error('Failed to load game:', e)
      }
    }
    return false
  }

  // 更新状态的辅助函数
  const updateGameState = (updates: Partial<GameState>) => {
    Object.assign(gameState, updates)
  }

  async function initGame(characterClass: CharacterClass) {
    try {
      // 生成地图
      const mapConfig = {
        width: 20,
        height: 15,
        minRooms: 2,
        maxRooms: 4,
        minRoomSize: 3,
        maxRoomSize: 6
      }

      const { map, rooms } = generateMap(mapConfig)
      console.log('Generated map:', {
        dimensions: { width: map[0]?.length, height: map.length },
        roomCount: rooms.length
      })

      if (!rooms.length || !map.length || !map[0]?.length) {
        console.error('Failed to generate valid map')
        return false
      }

      // 设置玩家初始位置
      const startRoom = rooms[0]
      const initialPosition = {
        x: Math.floor(startRoom.x + startRoom.width / 2),
        y: Math.floor(startRoom.y + startRoom.height / 2)
      }

      // 验证初始位置
      if (
        initialPosition.y >= 0 &&
        initialPosition.y < map.length &&
        initialPosition.x >= 0 &&
        initialPosition.x < map[0].length &&
        map[initialPosition.y][initialPosition.x].walkable
      ) {
        console.log('Valid initial position:', initialPosition)
      } else {
        console.error('Invalid initial position:', initialPosition)
        // 寻找第一个可行走的位置
        let found = false
        for (let y = 0; y < map.length && !found; y++) {
          for (let x = 0; x < map[y].length; x++) {
            if (map[y][x].walkable) {
              initialPosition.x = x
              initialPosition.y = y
              console.log('Found alternative initial position:', initialPosition)
              found = true
              break
            }
          }
        }
        if (!found) {
          console.error('No walkable position found')
          return false
        }
      }

      // 创建初始玩家状态
      const initialPlayer: Entity = {
        type: 'player',
        position: initialPosition,
        class: characterClass,
        stats: {
          health: 120,
          maxHealth: 120,
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
        skills: [],
        inventory: [],
        equipment: {
          weapon: undefined,
          armor: undefined,
          accessory: undefined
        }
      }

      // 生成敌人
      const enemies: Entity[] = []
      for (let i = 1; i < rooms.length; i++) {
        const room = rooms[i]
        const enemyPosition = {
          x: Math.floor(room.x + room.width / 2),
          y: Math.floor(room.y + room.height / 2)
        }
        // 验证敌人位置
        if (
          enemyPosition.y >= 0 &&
          enemyPosition.y < map.length &&
          enemyPosition.x >= 0 &&
          enemyPosition.x < map[0].length &&
          map[enemyPosition.y][enemyPosition.x].walkable
        ) {
          const enemy = createEnemy(enemyPosition, 1)
          enemies.push(enemy)
        }
      }

      // 创建新的地图数据
      const mapData = map.map(row => row.map(tile => ({ ...tile })))

      // 更新状态
      const newState: GameState = {
        map: mapData,
        player: initialPlayer,
        enemies,
        turn: 1,
        isPlayerTurn: true,
        gameStatus: 'playing',
        score: 0,
        messages: ['Welcome to the game!']
      }

      // 直接更新状态
      Object.assign(gameState, newState)

      console.log('Game initialized:', {
        playerPosition: gameState.player.position,
        mapSize: {
          height: gameState.map.length,
          width: gameState.map[0]?.length
        },
        walkableTiles: mapData.flat().filter(tile => tile.walkable).length,
        enemies: gameState.enemies.length
      })

      return true
    } catch (error) {
      console.error('Error initializing game:', error)
      return false
    }
  }

  function deleteSaveData() {
    localStorage.removeItem('gameState')
    hasSaveData.value = false
  }

  // 检查是否有存档
  function checkSaveData() {
    const savedData = localStorage.getItem('gameState')
    hasSaveData.value = savedData !== null
  }

  // 初始化时检查存档
  checkSaveData()

  function movePlayer(newPosition: Position): boolean {
    console.log('Attempting to move player to:', newPosition)

    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'playing') {
      console.log('Cannot move: not player turn or game not in playing state')
      return false
    }

    const map = gameState.map
    if (!map[newPosition.y] || !map[newPosition.y][newPosition.x]) {
      console.log('Cannot move: position out of bounds')
      return false
    }

    const targetTile = map[newPosition.y][newPosition.x]
    console.log('Target tile:', targetTile)

    if (!targetTile.walkable) {
      console.log('Cannot move: tile not walkable')
      return false
    }

    // 检查是否有敌人在目标位置
    const enemyAtPosition = gameState.enemies.find(
      enemy => enemy.position.x === newPosition.x && enemy.position.y === newPosition.y
    )

    if (enemyAtPosition) {
      console.log('Enemy at target position, initiating combat')
      // 处理战斗
      handleCombat(gameState.player, enemyAtPosition)
      return true
    }

    // 移动玩家
    console.log('Moving player from', gameState.player.position, 'to', newPosition)
    gameState.player.position = newPosition
    gameState.messages.push(`Moved to (${newPosition.x}, ${newPosition.y})`)

    // 切换回合
    endPlayerTurn()
    return true
  }

  function handleCombat(attacker: Entity, defender: Entity) {
    // 玩家攻击敌人
    const damage = Math.max(1, attacker.stats.attack - defender.stats.defense)
    defender.stats.health -= damage

    // 敌人反击
    if (defender.type === 'enemy' && defender.stats.health > 0) {
      const counterDamage = Math.max(1, defender.stats.attack - attacker.stats.defense)
      attacker.stats.health -= counterDamage

      if (attacker.stats.health <= 0) {
        gameState.gameStatus = 'gameover'
      }
    }

    // 如果敌人死亡，从游戏中移除
    if (defender.type === 'enemy' && defender.stats.health <= 0) {
      gameState.enemies = gameState.enemies.filter(
        e => e.position.x !== defender.position.x || e.position.y !== defender.position.y
      )
    }
  }

  function endPlayerTurn() {
    gameState.isPlayerTurn = false
    gameState.turn++

    // 模拟敌人回合
    setTimeout(() => {
      // 在这里可以添加敌人AI逻辑
      gameState.isPlayerTurn = true
    }, 100)
  }

  return {
    gameState,
    hasSaveData,
    loadGame,
    initGame,
    deleteSaveData,
    movePlayer
  }
}

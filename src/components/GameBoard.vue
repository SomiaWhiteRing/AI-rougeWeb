<template>
  <div class="game-board">
    <GameStatus
      :player="gameState.player"
      :turn="gameState.turn"
      :score="gameState.score"
      :enemyCount="gameState.enemies.length"
      :gameStatus="gameState.gameStatus"
    />

    <div class="game-area">
      <div class="map-container">
        <div v-if="!isGameReady" class="loading">Loading map...</div>
        <template v-else>
          <div class="debug-info">
            Map size: {{ mapData.length }}x{{ mapData[0]?.length }} Player at: ({{
              playerPosition.x
            }}, {{ playerPosition.y }})
          </div>
          <div v-for="(row, y) in mapData" :key="y" class="map-row">
            <div
              v-for="(tile, x) in row"
              :key="`${x}-${y}`"
              class="map-tile"
              :class="{
                floor: tile?.type === 'floor',
                wall: tile?.type === 'wall',
                door: tile?.type === 'door',
                stairs: tile?.type === 'stairs',
                player: isPlayerPosition(x, y),
                enemy: isEnemyPosition(x, y)
              }"
            >
              <template v-if="isPlayerPosition(x, y)">@</template>
              <template v-else-if="isEnemyPosition(x, y)">E</template>
              <template v-else-if="tile?.type === 'stairs'">&gt;</template>
              <template v-else-if="tile?.type === 'door'">+</template>
              <template v-else-if="tile?.type === 'wall'">#</template>
              <template v-else>.</template>
            </div>
          </div>
        </template>
      </div>

      <!-- 浮动消息系统 -->
      <div class="floating-messages" @click="clearMessages">
        <TransitionGroup name="message-fade">
          <div
            v-for="message in activeMessages"
            :key="message.id"
            class="floating-message"
            :style="{ '--delay': `${message.id * 0.1}s` }"
          >
            {{ message.text }}
          </div>
        </TransitionGroup>
      </div>

      <div class="control-area">
        <div class="control-pad">
          <button class="control-btn up" @click="handleMove('up')">↑</button>
          <button class="control-btn left" @click="handleMove('left')">←</button>
          <button class="control-btn right" @click="handleMove('right')">→</button>
          <button class="control-btn down" @click="handleMove('down')">↓</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import GameStatus from './GameStatus.vue'
import type { Position } from '../types/position'
import type { GameState } from '../types/game'
import { useGameEngine } from '../composables/useGameEngine'

interface Message {
  id: number
  text: string
  timestamp: number
}

const messageTimeout = 3000 // 消息显示时间（毫秒）
let messageId = 0

const messages = ref<Message[]>([])
const activeMessages = computed(() => {
  const now = Date.now()
  return messages.value.filter(msg => now - msg.timestamp < messageTimeout)
})

const addMessage = (text: string) => {
  messageId++
  messages.value.push({
    id: messageId,
    text,
    timestamp: Date.now()
  })
  // 自动清理过期消息
  setTimeout(() => {
    messages.value = messages.value.filter(msg => Date.now() - msg.timestamp < messageTimeout)
  }, messageTimeout)
}

const clearMessages = () => {
  messages.value = []
}

const { gameState, movePlayer } = useGameEngine()

// 添加游戏状态就绪标志
const isGameReady = ref(false)

// 使用计算属性监听状态变化
const currentGameState = computed(() => {
  const isValid = gameState.map?.length > 0 && gameState.map[0]?.length > 0
  isGameReady.value = isValid
  console.log('Game state updated:', {
    mapSize: gameState.map?.length || 0,
    mapData: JSON.stringify(gameState.map),
    playerPos: gameState.player.position,
    enemies: gameState.enemies.length,
    mapValid: isValid
  })
  return gameState
})

// 添加地图数据的计算属性
const mapData = computed(() => {
  console.log('Computing map data:', {
    hasMap: !!gameState.map,
    mapSize: gameState.map?.length || 0,
    sampleTile: gameState.map?.[0]?.[0]
  })
  return gameState.map || []
})

const playerPosition = computed(() => {
  const pos = gameState.player.position
  console.log('Player position:', pos)
  return pos
})

const enemyPositions = computed(() => gameState.enemies.map(enemy => enemy.position))

// 检查是否是玩家位置
const isPlayerPosition = (x: number, y: number): boolean => {
  const pos = playerPosition.value
  return pos.x === x && pos.y === y
}

// 检查是否是敌人位置
const isEnemyPosition = (x: number, y: number): boolean => {
  return enemyPositions.value.some(pos => pos.x === x && pos.y === y)
}

// 处理移动
const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
  console.log('Moving:', direction)
  const currentPos = playerPosition.value
  let newPosition: Position

  switch (direction) {
    case 'up':
      newPosition = { x: currentPos.x, y: currentPos.y - 1 }
      break
    case 'down':
      newPosition = { x: currentPos.x, y: currentPos.y + 1 }
      break
    case 'left':
      newPosition = { x: currentPos.x - 1, y: currentPos.y }
      break
    case 'right':
      newPosition = { x: currentPos.x + 1, y: currentPos.y }
      break
    default:
      return
  }

  const moved = movePlayer(newPosition)
  if (!moved) {
    addMessage('Cannot move there!')
  }
}

// 添加键盘事件监听
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      handleMove('up')
      break
    case 'ArrowDown':
    case 's':
      handleMove('down')
      break
    case 'ArrowLeft':
    case 'a':
      handleMove('left')
      break
    case 'ArrowRight':
    case 'd':
      handleMove('right')
      break
  }
}

// 监听地图变化
watch(
  () => gameState.map,
  newMap => {
    if (!newMap) return
    console.log('Map updated:', {
      size: newMap.length > 0 ? `${newMap.length}x${newMap[0].length}` : 'empty',
      walkableTiles: newMap.flat().filter(tile => tile?.walkable).length,
      valid: newMap.length > 0 && newMap[0]?.length > 0,
      sampleTile: JSON.stringify(newMap?.[0]?.[0])
    })
    // 强制更新游戏就绪状态
    isGameReady.value = newMap.length > 0 && newMap[0]?.length > 0
  },
  { immediate: true, deep: true }
)

// 在组件挂载时检查状态
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // 等待下一个tick确保状态已更新
  nextTick(async () => {
    console.log('Component mounted, game state:', {
      mapSize: gameState.map.length,
      playerPos: gameState.player.position,
      enemies: gameState.enemies.length,
      mapValid: gameState.map.length > 0 && gameState.map[0]?.length > 0
    })

    if (!isGameReady.value) {
      console.warn('Waiting for game state to be ready...')
      addMessage('Initializing game...')
    } else {
      addMessage('Welcome to the game!')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 监听游戏消息
watch(
  () => gameState.messages,
  (newMessages: string[], oldMessages?: string[]) => {
    if (newMessages.length > (oldMessages?.length || 0)) {
      const latestMessage = newMessages[newMessages.length - 1]
      addMessage(latestMessage)
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #1a1a1a;
  color: #ffffff;
  touch-action: none;
  user-select: none;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  padding-bottom: 12rem;
}

.map-container {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.debug-info {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.8rem;
  z-index: 100;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

.map-row {
  display: flex;
  justify-content: center;
  min-height: 2rem;
}

.map-tile {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.floor {
  background-color: #222;
  color: #666;
}

.wall {
  background-color: #333;
  color: #888;
}

.door {
  background-color: #422;
  color: #964b00;
}

.stairs {
  background-color: #442;
  color: #ffd700;
}

.player {
  background-color: #242;
  color: #4caf50;
  animation: pulse 1s infinite;
}

.enemy {
  background-color: #422;
  color: #f44336;
  animation: shake 0.5s infinite;
}

.control-area {
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
}

.control-pad {
  pointer-events: auto;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 1rem;
  display: grid;
  grid-template-areas:
    '. up .'
    'left . right'
    '. down .';
  gap: 0.5rem;
}

.control-btn {
  width: 3.5rem;
  height: 3.5rem;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.control-btn:active {
  transform: scale(0.95);
  background-color: rgba(255, 255, 255, 0.3);
}

.control-btn.up {
  grid-area: up;
}
.control-btn.left {
  grid-area: left;
}
.control-btn.right {
  grid-area: right;
}
.control-btn.down {
  grid-area: down;
}

@media (max-width: 768px) {
  .map-tile {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 1rem;
  }

  .control-btn {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .message-log {
    width: 90%;
    max-height: 4rem;
  }
}

@media (max-width: 480px) {
  .map-tile {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.9rem;
  }

  .control-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .message-log {
    width: 95%;
    max-height: 3.5rem;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

.floating-messages {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 1000;
}

.floating-message {
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin: 0.25rem 0;
  font-size: 1rem;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
  animation: messageFloat 3s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

@keyframes messageFloat {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

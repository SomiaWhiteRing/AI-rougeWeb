<template>
  <div class="game-board">
    <GameStatus
      :player="currentGameState.player"
      :turn="currentGameState.turn"
      :score="currentGameState.score"
      :enemyCount="currentGameState.enemies.length"
      :gameStatus="currentGameState.gameStatus"
    />

    <div class="game-area">
      <div class="map-container">
        <div v-for="(row, y) in currentGameState.map" :key="y" class="map-row">
          <div
            v-for="(tile, x) in row"
            :key="`${x}-${y}`"
            class="map-tile"
            :class="{
              floor: tile.type === 'floor',
              wall: tile.type === 'wall',
              door: tile.type === 'door',
              stairs: tile.type === 'stairs',
              player: isPlayerPosition(x, y),
              enemy: isEnemyPosition(x, y)
            }"
          >
            <template v-if="isPlayerPosition(x, y)">@</template>
            <template v-else-if="isEnemyPosition(x, y)">E</template>
            <template v-else-if="tile.type === 'stairs'">&gt;</template>
            <template v-else-if="tile.type === 'door'">+</template>
            <template v-else-if="tile.type === 'wall'">#</template>
            <template v-else>.</template>
          </div>
        </div>
      </div>

      <div class="control-area">
        <div class="message-log">
          <div v-for="(message, index) in messages" :key="index" class="message">
            {{ message }}
          </div>
        </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameStatus from './GameStatus.vue'
import type { Position } from '../types/position'
import type { GameState } from '../types/game'
import { useGameEngine } from '../composables/useGameEngine'

const messages = ref(['Welcome to the game!'])
const { gameState, movePlayer } = useGameEngine()
const currentGameState = computed(() => gameState.value)
const playerPosition = computed(() => currentGameState.value.player.position)
const enemyPositions = computed(() => currentGameState.value.enemies.map(enemy => enemy.position))

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

  console.log('Current position:', currentPos)
  console.log('New position:', newPosition)

  const moved = movePlayer(newPosition)
  if (!moved) {
    messages.value.push('Cannot move there!')
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

// 在组件挂载时添加键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// 在组件卸载时移除键盘事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
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

.map-row {
  display: flex;
  justify-content: center;
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
}

.floor {
  color: #666;
}

.wall {
  color: #888;
}

.door {
  color: #964b00;
}

.stairs {
  color: #ffd700;
}

.player {
  color: #4caf50;
  animation: pulse 1s infinite;
}

.enemy {
  color: #f44336;
  animation: shake 0.5s infinite;
}

.control-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 12rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.message-log {
  width: 80%;
  max-width: 600px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  border-radius: 0.5rem;
  max-height: 5rem;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #ffffff;
}

.control-pad {
  display: grid;
  grid-template-areas:
    '. up .'
    'left . right'
    '. down .';
  gap: 0.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 1rem;
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
</style>

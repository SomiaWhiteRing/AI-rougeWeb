<template>
  <div class="app">
    <MainMenu
      v-if="!isPlaying"
      :hasSaveData="hasSaveData"
      @continue="continueGame"
      @new-game="startNewGame"
      @delete-save="handleDeleteSave"
    />
    <GameBoard v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MainMenu from './components/MainMenu.vue'
import GameBoard from './components/GameBoard.vue'
import { useGameEngine } from './composables/useGameEngine'
import type { CharacterClass } from './types/entity'

const isPlaying = ref(false)
const { gameState, hasSaveData, loadGame, initGame, deleteSaveData } = useGameEngine()

const continueGame = async () => {
  isPlaying.value = false // 重置状态

  if (loadGame()) {
    // 确保存档数据有效
    if (gameState.map.length > 0) {
      await nextTick()
      isPlaying.value = true
    } else {
      console.error('Invalid save data: map not found')
    }
  }
}

const startNewGame = async (characterClass: CharacterClass) => {
  console.log('Starting new game with class:', characterClass)
  isPlaying.value = false // 重置状态

  const success = await initGame(characterClass)
  console.log('Game initialized, current state:', {
    success,
    mapSize: gameState.map.length,
    playerPos: gameState.player.position,
    enemies: gameState.enemies.length
  })

  // 确保地图已经生成
  if (success && gameState.map.length > 0) {
    // 等待下一个tick确保状态已完全更新
    await nextTick()
    isPlaying.value = true
  } else {
    console.error('Failed to initialize game: map not generated')
  }
}

const handleDeleteSave = () => {
  deleteSaveData()
}

// 监听游戏状态
watch(
  () => gameState,
  newState => {
    console.log('Game state changed:', {
      mapSize: newState.map.length,
      mapValid: newState.map.length > 0 && newState.map[0]?.length > 0,
      playerPos: newState.player.position,
      status: newState.gameStatus
    })
  },
  { deep: true }
)
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #1a1a1a;
  color: #ffffff;
  overflow: hidden;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

* {
  box-sizing: border-box;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

button {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>

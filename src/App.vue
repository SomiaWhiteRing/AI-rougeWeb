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
import { ref } from 'vue'
import MainMenu from './components/MainMenu.vue'
import GameBoard from './components/GameBoard.vue'
import { useGameEngine } from './composables/useGameEngine'
import type { CharacterClass } from './types/entity'

const isPlaying = ref(false)
const { gameState, hasSaveData, loadGame, initGame, deleteSaveData } = useGameEngine()

const continueGame = () => {
  if (loadGame()) {
    isPlaying.value = true
  }
}

const startNewGame = (characterClass: CharacterClass) => {
  initGame(characterClass)
  isPlaying.value = true
}

const handleDeleteSave = () => {
  deleteSaveData()
}
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

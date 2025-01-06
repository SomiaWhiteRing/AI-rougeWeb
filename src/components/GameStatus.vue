<template>
  <div class="game-status">
    <div class="status-row">
      <div class="status-item">
        <span class="label">生命值:</span>
        <span class="value">{{ player.stats.health }}/{{ player.stats.maxHealth }}</span>
      </div>
      <div class="status-item">
        <span class="label">魔法值:</span>
        <span class="value">{{ player.stats.mana }}/{{ player.stats.maxMana }}</span>
      </div>
      <div class="status-item">
        <span class="label">等级:</span>
        <span class="value">{{ player.stats.level }}</span>
      </div>
    </div>
    <div class="status-row">
      <div class="status-item">
        <span class="label">回合:</span>
        <span class="value">{{ turn }}</span>
      </div>
      <div class="status-item">
        <span class="label">分数:</span>
        <span class="value">{{ score }}</span>
      </div>
      <div class="status-item">
        <span class="label">敌人数量:</span>
        <span class="value">{{ enemyCount }}</span>
      </div>
    </div>
    <div v-if="gameStatus !== 'playing'" class="game-over">
      {{ gameStatus === 'win' ? '胜利！' : '游戏结束！' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Entity } from '../types'
import type { GameStatus } from '../types/game'

interface Props {
  player: Entity
  turn: number
  score: number
  enemyCount: number
  gameStatus: GameStatus
}

defineProps<Props>()
</script>

<style scoped>
.game-status {
  background-color: #2c3e50;
  padding: 1rem;
  border-bottom: 2px solid #34495e;
}

.status-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: #95a5a6;
  font-size: 0.9rem;
}

.value {
  color: #ecf0f1;
  font-weight: bold;
}

.game-over {
  text-align: center;
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}
</style>
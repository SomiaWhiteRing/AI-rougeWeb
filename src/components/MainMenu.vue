<template>
  <div class="main-menu">
    <div class="menu-container">
      <h1 class="game-title">Roguelike</h1>
      <div class="menu-buttons">
        <button v-if="hasSaveData" class="menu-button continue" @click="$emit('continue')">
          继续游戏
        </button>
        <button class="menu-button new-game" @click="handleNewGame">新游戏</button>
        <button v-if="hasSaveData" class="menu-button delete-save" @click="confirmDeleteSave">
          删除存档
        </button>
      </div>

      <!-- 职业选择对话框 -->
      <div v-if="showClassSelect" class="class-select-modal">
        <div class="modal-content">
          <h2>选择职业</h2>
          <div class="class-options">
            <div
              v-for="characterClass in characterClasses"
              :key="characterClass.id"
              class="class-option"
              :class="{ selected: selectedClass === characterClass.id }"
              @click="selectedClass = characterClass.id"
            >
              <div class="class-icon" :class="characterClass.id">
                {{ characterClass.icon }}
              </div>
              <div class="class-info">
                <h3>{{ characterClass.name }}</h3>
                <p>{{ characterClass.description }}</p>
                <div class="class-stats">
                  <div class="stat">
                    <span class="stat-label">生命</span>
                    <div class="stat-bar">
                      <div
                        class="stat-fill health"
                        :style="{ width: `${characterClass.stats.health}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat">
                    <span class="stat-label">魔法</span>
                    <div class="stat-bar">
                      <div
                        class="stat-fill mana"
                        :style="{ width: `${characterClass.stats.mana}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat">
                    <span class="stat-label">攻击</span>
                    <div class="stat-bar">
                      <div
                        class="stat-fill attack"
                        :style="{ width: `${characterClass.stats.attack}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat">
                    <span class="stat-label">防御</span>
                    <div class="stat-bar">
                      <div
                        class="stat-fill defense"
                        :style="{ width: `${characterClass.stats.defense}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat">
                    <span class="stat-label">速度</span>
                    <div class="stat-bar">
                      <div
                        class="stat-fill speed"
                        :style="{ width: `${characterClass.stats.speed}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="modal-button confirm" :disabled="!selectedClass" @click="startNewGame">
              开始游戏
            </button>
            <button class="modal-button cancel" @click="showClassSelect = false">返回</button>
          </div>
        </div>
      </div>

      <!-- 确认删除对话框 -->
      <div v-if="showDeleteConfirm" class="confirm-modal">
        <div class="modal-content">
          <h2>确认删除</h2>
          <p>确定要删除存档吗？此操作无法撤销。</p>
          <div class="modal-buttons">
            <button class="modal-button delete" @click="deleteSaveData">删除</button>
            <button class="modal-button cancel" @click="showDeleteConfirm = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CharacterClass } from '../types'

const props = defineProps<{
  hasSaveData: boolean
}>()

const emit = defineEmits<{
  (e: 'continue'): void
  (e: 'new-game', characterClass: CharacterClass): void
  (e: 'delete-save'): void
}>()

const showClassSelect = ref(false)
const showDeleteConfirm = ref(false)
const selectedClass = ref<CharacterClass | ''>('')

const characterClasses = [
  {
    id: 'warrior' as const,
    name: '战士',
    icon: '⚔️',
    description: '强大的近战职业，擅长正面战斗。',
    stats: {
      health: 100,
      mana: 50,
      attack: 80,
      defense: 90,
      speed: 60
    }
  },
  {
    id: 'rogue' as const,
    name: '盗贼',
    icon: '🗡️',
    description: '灵活的刺客职业，擅长暴击和闪避。',
    stats: {
      health: 70,
      mana: 60,
      attack: 90,
      defense: 50,
      speed: 100
    }
  },
  {
    id: 'mage' as const,
    name: '法师',
    icon: '🔮',
    description: '强大的法术职业，擅长范围攻击。',
    stats: {
      health: 60,
      mana: 100,
      attack: 95,
      defense: 40,
      speed: 50
    }
  }
]

const handleNewGame = () => {
  showClassSelect.value = true
}

const startNewGame = () => {
  if (selectedClass.value) {
    emit('new-game', selectedClass.value)
    showClassSelect.value = false
  }
}

const confirmDeleteSave = () => {
  showDeleteConfirm.value = true
}

const deleteSaveData = () => {
  emit('delete-save')
  showDeleteConfirm.value = false
}
</script>

<style scoped>
.main-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 1rem;
}

.menu-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.game-title {
  font-size: 3rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.menu-button.continue {
  background-color: #4caf50;
}

.menu-button.new-game {
  background-color: #2196f3;
}

.menu-button.delete-save {
  background-color: #f44336;
}

.class-select-modal,
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.class-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.class-option {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #333;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.class-option:hover {
  background-color: #444;
}

.class-option.selected {
  background-color: #1e88e5;
}

.class-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #444;
  border-radius: 0.5rem;
}

.class-info {
  flex: 1;
  text-align: left;
}

.class-info h3 {
  margin: 0 0 0.5rem 0;
}

.class-info p {
  margin: 0 0 1rem 0;
  color: #aaa;
}

.class-stats {
  display: grid;
  gap: 0.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  width: 3rem;
  text-align: right;
  font-size: 0.9rem;
  color: #aaa;
}

.stat-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #444;
  border-radius: 0.25rem;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stat-fill.health {
  background-color: #4caf50;
}

.stat-fill.mana {
  background-color: #2196f3;
}

.stat-fill.attack {
  background-color: #f44336;
}

.stat-fill.defense {
  background-color: #ffc107;
}

.stat-fill.speed {
  background-color: #9c27b0;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button:hover {
  transform: translateY(-2px);
}

.modal-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.modal-button.confirm {
  background-color: #4caf50;
  color: white;
}

.modal-button.cancel {
  background-color: #9e9e9e;
  color: white;
}

.modal-button.delete {
  background-color: #f44336;
  color: white;
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2rem;
  }

  .menu-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .class-option {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .class-info {
    text-align: center;
  }

  .stat-label {
    width: 2.5rem;
    font-size: 0.8rem;
  }
}
</style>

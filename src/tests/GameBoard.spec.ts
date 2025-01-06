import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '../components/GameBoard.vue'
import { useGameEngine } from '../composables/useGameEngine'

// Mock useGameEngine
vi.mock('../composables/useGameEngine', () => ({
  useGameEngine: () => ({
    gameState: {
      map: [],
      player: {
        position: { x: 0, y: 0 },
        stats: {
          health: 100,
          maxHealth: 100,
          level: 1
        }
      },
      enemies: [],
      turn: 1,
      score: 0,
      gameStatus: 'playing',
      messages: ['Welcome to the game!']
    },
    movePlayer: vi.fn()
  })
}))

describe('GameBoard.vue', () => {
  it('renders properly', () => {
    const wrapper = mount(GameBoard)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains game grid', () => {
    const wrapper = mount(GameBoard)
    const grid = wrapper.find('.map-container')
    expect(grid.exists()).toBe(true)
  })

  it('handles movement controls', async () => {
    const wrapper = mount(GameBoard)
    const controls = wrapper.find('.control-pad')
    expect(controls.exists()).toBe(true)

    const upButton = wrapper.find('.control-btn.up')
    expect(upButton.exists()).toBe(true)
    await upButton.trigger('click')
  })

  it('displays game messages', () => {
    const wrapper = mount(GameBoard)
    const messages = wrapper.find('.floating-messages')
    expect(messages.exists()).toBe(true)

    // 等待消息系统初始化
    setTimeout(() => {
      const messageElements = wrapper.findAll('.floating-message')
      expect(messageElements.length).toBeGreaterThan(0)
      expect(messageElements[0].text()).toContain('Initializing game...')
    }, 100)
  })
})

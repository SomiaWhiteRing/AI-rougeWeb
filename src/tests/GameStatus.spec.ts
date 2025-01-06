import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GameStatus from '../components/GameStatus.vue'
import { createPinia, setActivePinia } from 'pinia'
import type { Entity } from '../types'

describe('GameStatus.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockPlayer: Entity = {
    class: 'warrior',
    type: 'player',
    position: { x: 0, y: 0 },
    stats: {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      level: 1,
      experience: 0,
      speed: 3,
      criticalChance: 0.1,
      criticalDamage: 1.5,
      attributePoints: 0,
      bonuses: [],
      statusEffects: []
    },
    inventory: [],
    equipment: {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    }
  }

  const mockProps = {
    player: mockPlayer,
    turn: 1,
    score: 0,
    enemyCount: 5,
    gameStatus: 'playing' as const
  }

  it('renders properly', () => {
    const wrapper = mount(GameStatus, {
      props: mockProps
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays player stats', () => {
    const wrapper = mount(GameStatus, {
      props: mockProps
    })
    expect(wrapper.find('.status-row').exists()).toBe(true)
    expect(wrapper.text()).toContain('等级')
  })

  it('shows health information', () => {
    const wrapper = mount(GameStatus, {
      props: mockProps
    })
    expect(wrapper.find('.status-item').exists()).toBe(true)
    expect(wrapper.text()).toContain('100/100')
  })

  it('displays level information', () => {
    const wrapper = mount(GameStatus, {
      props: mockProps
    })
    expect(wrapper.find('.status-item').exists()).toBe(true)
    expect(wrapper.text()).toContain('等级')
  })
})

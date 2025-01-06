import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '../components/GameBoard.vue'
import { createPinia, setActivePinia } from 'pinia'
import type { Entity } from '../types/entity'
import type { Position } from '../types/position'

describe('GameBoard.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockPlayer: Entity = {
    type: 'player',
    class: 'warrior',
    position: { x: 5, y: 5 } as Position,
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
    skills: [],
    inventory: [],
    equipment: {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    }
  }

  const mockProps = {
    player: mockPlayer,
    enemies: [],
    map: Array(10).fill(Array(10).fill(0)),
    messages: ['Welcome to the game!'],
    isPlayerTurn: true
  }

  it('renders properly', () => {
    const wrapper = mount(GameBoard, {
      props: mockProps
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('contains game grid', () => {
    const wrapper = mount(GameBoard, {
      props: mockProps
    })
    expect(wrapper.find('.game-board').exists()).toBe(true)
  })

  it('handles movement controls', async () => {
    const wrapper = mount(GameBoard, {
      props: mockProps
    })
    const controls = wrapper.find('.control-pad')
    expect(controls.exists()).toBe(true)
  })

  it('displays game messages', () => {
    const wrapper = mount(GameBoard, {
      props: mockProps
    })
    const messages = wrapper.find('.message-log')
    expect(messages.exists()).toBe(true)
    expect(messages.text()).toContain('Welcome to the game!')
  })
})

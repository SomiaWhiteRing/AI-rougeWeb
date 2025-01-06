import { describe, it, expect, beforeEach } from 'vitest'
import { getSkill, canUseSkill } from '../utils/skillManager'
import type { Entity } from '../types'
import type { Skill } from '../types/skills'

describe('SkillManager', () => {
  let player: Entity
  let _enemy: Entity
  let skill: Skill

  beforeEach(() => {
    // 创建测试玩家
    player = {
      position: { x: 1, y: 1 },
      stats: {
        health: 100,
        maxHealth: 100,
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
      class: 'warrior',
      type: 'player'
    }

    // 创建测试敌人
    _enemy = {
      position: { x: 2, y: 1 },
      stats: {
        health: 50,
        maxHealth: 50,
        mana: 50,
        maxMana: 50,
        attack: 8,
        defense: 3,
        level: 1,
        experience: 0,
        speed: 4,
        criticalChance: 0.1,
        criticalDamage: 1.5,
        attributePoints: 0,
        bonuses: [],
        statusEffects: []
      },
      class: 'warrior',
      type: 'enemy'
    }

    // 创建测试技能
    skill = {
      id: 'test-skill',
      name: '测试技能',
      description: '这是一个测试技能',
      type: 'attack',
      targetType: 'single',
      range: 1,
      area: 1,
      manaCost: 10,
      cooldown: 3,
      currentCooldown: 0,
      effects: [
        {
          type: 'damage',
          value: 15
        }
      ],
      requirements: {
        class: ['warrior'],
        level: 1
      }
    }
  })

  it('should check if skill can be used', () => {
    expect(canUseSkill(player, skill)).toBe(true)

    // 测试魔法值不足
    player.stats.mana = 5
    expect(canUseSkill(player, skill)).toBe(false)

    // 测试冷却时间
    player.stats.mana = 100
    skill.currentCooldown = 2
    expect(canUseSkill(player, skill)).toBe(false)
  })

  it('should get skill by id', () => {
    const skillId = 'slash'
    const foundSkill = getSkill(skillId)
    expect(foundSkill).toBeDefined()
    expect(foundSkill?.id).toBe(skillId)
  })

  it('should return null for invalid skill id', () => {
    const foundSkill = getSkill('invalid-skill')
    expect(foundSkill).toBeNull()
  })
})

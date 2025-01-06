import type { Entity, Position, CharacterClass } from '../types'
import type { EntityStats } from '../types/stats'

// 基础职业属性配置
const CLASS_BASE_STATS: Record<CharacterClass, EntityStats> = {
  warrior: {
    health: 120,
    maxHealth: 120,
    mana: 50,
    maxMana: 50,
    attack: 12,
    defense: 8,
    level: 1,
    experience: 0,
    speed: 4,
    criticalChance: 0.1,
    criticalDamage: 1.5,
    attributePoints: 0,
    bonuses: [],
    statusEffects: []
  },
  rogue: {
    health: 80,
    maxHealth: 80,
    mana: 70,
    maxMana: 70,
    attack: 15,
    defense: 5,
    level: 1,
    experience: 0,
    speed: 6,
    criticalChance: 0.2,
    criticalDamage: 2.0,
    attributePoints: 0,
    bonuses: [],
    statusEffects: []
  },
  mage: {
    health: 70,
    maxHealth: 70,
    mana: 100,
    maxMana: 100,
    attack: 8,
    defense: 4,
    level: 1,
    experience: 0,
    speed: 3,
    criticalChance: 0.05,
    criticalDamage: 1.8,
    attributePoints: 0,
    bonuses: [],
    statusEffects: []
  }
}

// 创建角色
export function createCharacter(
  position: Position,
  characterClass: CharacterClass,
  level: number = 1
): Entity {
  const baseStats = { ...CLASS_BASE_STATS[characterClass] }

  // 根据等级提升属性
  for (let i = 1; i < level; i++) {
    baseStats.maxHealth += 10
    baseStats.maxMana += 5
    baseStats.attack += 2
    baseStats.defense += 1
    baseStats.speed += 0.2
    baseStats.attributePoints += 3
  }

  baseStats.health = baseStats.maxHealth
  baseStats.mana = baseStats.maxMana
  baseStats.level = level

  return {
    position,
    stats: baseStats,
    class: characterClass,
    type: 'player',
    inventory: [],
    equipment: {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    }
  }
}

// 创建敌人
export function createEnemy(position: Position, level: number): Entity {
  // 随机选择敌人职业
  const enemyClasses: CharacterClass[] = ['warrior', 'rogue', 'mage']
  const randomClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)]

  const enemy = createCharacter(position, randomClass, level)
  enemy.type = 'enemy'
  return enemy
}

// 计算总属性（包含加成）
export function calculateTotalStats(entity: Entity): EntityStats {
  // 创建一个新的对象来存储总属性
  const totalStats: EntityStats = {
    ...entity.stats,
    bonuses: [...(entity.stats.bonuses || [])],
    statusEffects: [...(entity.stats.statusEffects || [])]
  }

  // 应用所有状态加成
  for (const bonus of totalStats.bonuses) {
    const key = bonus.type as keyof EntityStats
    if (typeof totalStats[key] === 'number' && key !== 'bonuses' && key !== 'statusEffects') {
      const baseValue = entity.stats[key] as number
      totalStats[key] = baseValue + bonus.value
    }
  }

  return totalStats
}

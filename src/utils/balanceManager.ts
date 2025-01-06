import type { Entity, CharacterClass } from '../types/entity'
import type { EntityStats } from '../types/stats'
import type { Skill } from '../types/skills'
import type { ItemRarity } from '../types/items'

// 经验值曲线配置
const EXPERIENCE_CURVE = {
  baseExperience: 100, // 基础升级经验
  growthRate: 1.5, // 经验增长率
  maxLevel: 30 // 最大等级
}

// 属性成长配置
const STAT_GROWTH: Record<CharacterClass, Partial<EntityStats>> = {
  warrior: {
    maxHealth: 15,
    maxMana: 5,
    attack: 3,
    defense: 2,
    speed: 0.2,
    criticalChance: 0.01,
    criticalDamage: 0.05
  },
  rogue: {
    maxHealth: 10,
    maxMana: 8,
    attack: 4,
    defense: 1,
    speed: 0.3,
    criticalChance: 0.02,
    criticalDamage: 0.1
  },
  mage: {
    maxHealth: 8,
    maxMana: 15,
    attack: 2,
    defense: 1,
    speed: 0.15,
    criticalChance: 0.01,
    criticalDamage: 0.08
  }
}

// 难度系数配置
const DIFFICULTY_SCALING = {
  enemyStatMultiplier: 1.1, // 每层敌人属性倍率
  enemyCountMultiplier: 1.2, // 每层敌人数量倍率
  baseEnemyCount: 5, // 初始敌人数量
  maxEnemyCount: 20, // 最大敌人数量
  bossStatMultiplier: 2.0 // Boss属性倍率
}

// 掉落率配置
const DROP_RATES = {
  common: 0.6,
  uncommon: 0.3,
  rare: 0.08,
  epic: 0.02
}

// 计算升级所需经验值
export function calculateRequiredExperience(level: number): number {
  if (level >= EXPERIENCE_CURVE.maxLevel) return -1
  return Math.floor(
    EXPERIENCE_CURVE.baseExperience * Math.pow(EXPERIENCE_CURVE.growthRate, level - 1)
  )
}

// 计算属性成长
export function calculateStatGrowth(
  characterClass: CharacterClass,
  currentStats: EntityStats,
  levelGained: number
): EntityStats {
  const growth = STAT_GROWTH[characterClass]
  const newStats = { ...currentStats }

  for (let i = 0; i < levelGained; i++) {
    if (growth.maxHealth) newStats.maxHealth += growth.maxHealth
    if (growth.maxMana) newStats.maxMana += growth.maxMana
    if (growth.attack) newStats.attack += growth.attack
    if (growth.defense) newStats.defense += growth.defense
    if (growth.speed) newStats.speed += growth.speed
    if (growth.criticalChance) newStats.criticalChance += growth.criticalChance
    if (growth.criticalDamage) newStats.criticalDamage += growth.criticalDamage
    newStats.attributePoints += 3
  }

  // 同步生命值和魔法值
  newStats.health = newStats.maxHealth
  newStats.mana = newStats.maxMana

  return newStats
}

// 计算难度系数
export function calculateDifficultyMultiplier(floor: number): number {
  return Math.pow(DIFFICULTY_SCALING.enemyStatMultiplier, floor - 1)
}

// 计算当前层敌人数量
export function calculateEnemyCount(floor: number): number {
  const count = Math.floor(
    DIFFICULTY_SCALING.baseEnemyCount * Math.pow(DIFFICULTY_SCALING.enemyCountMultiplier, floor - 1)
  )
  return Math.min(count, DIFFICULTY_SCALING.maxEnemyCount)
}

// 计算伤害
export function calculateDamage(
  attacker: Entity,
  defender: Entity,
  skill?: Skill
): { damage: number; isCritical: boolean } {
  const attackerStats = attacker.stats
  const defenderStats = defender.stats

  // 基础伤害
  let baseDamage = attackerStats.attack

  // 技能伤害
  if (skill?.effects) {
    const damageEffect = skill.effects.find(effect => effect.type === 'damage')
    if (damageEffect?.value) {
      baseDamage += damageEffect.value
    }
  }

  // 暴击判定
  const isCritical = Math.random() < attackerStats.criticalChance
  if (isCritical) {
    baseDamage *= attackerStats.criticalDamage
  }

  // 防御计算
  const damageReduction = defenderStats.defense / (defenderStats.defense + 50)
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction)))

  return { damage: finalDamage, isCritical }
}

// 计算经验值奖励
export function calculateExperienceReward(playerLevel: number, enemyLevel: number): number {
  const levelDifference = enemyLevel - playerLevel
  const baseExperience = 20

  // 根据等级差异调整经验值
  let experienceMultiplier = 1
  if (levelDifference > 0) {
    experienceMultiplier = 1 + levelDifference * 0.2
  } else if (levelDifference < 0) {
    experienceMultiplier = Math.max(0.1, 1 + levelDifference * 0.1)
  }

  return Math.floor(baseExperience * experienceMultiplier)
}

// 计算物品掉落
export function calculateItemDrop(enemyLevel: number): ItemRarity {
  const roll = Math.random()
  let rarity: ItemRarity

  if (roll < DROP_RATES.epic) {
    rarity = 'epic'
  } else if (roll < DROP_RATES.epic + DROP_RATES.rare) {
    rarity = 'rare'
  } else if (roll < DROP_RATES.epic + DROP_RATES.rare + DROP_RATES.uncommon) {
    rarity = 'uncommon'
  } else {
    rarity = 'common'
  }

  return rarity
}

// 计算技能效果
export function calculateSkillEffect(skill: Skill, source: Entity, target: Entity): number {
  let effectValue = 0

  skill.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage':
        const { damage } = calculateDamage(source, target, skill)
        effectValue += damage
        break
      case 'heal':
        effectValue += effect.value + source.stats.attack * 0.5
        break
      case 'buff':
        effectValue += effect.value
        break
    }
  })

  return Math.floor(effectValue)
}

// 计算状态效果
export function calculateStatusEffect(
  effect: { type: string; value: number; duration: number },
  source: Entity,
  target: Entity
): { value: number; duration: number } {
  let value = effect.value
  let duration = effect.duration

  // 根据来源和目标的属性调整效果
  switch (effect.type) {
    case 'poison':
    case 'burn':
      value = Math.floor(value + source.stats.attack * 0.2)
      break
    case 'heal':
      value = Math.floor(value + source.stats.attack * 0.3)
      break
    case 'stun':
    case 'slow':
      duration = Math.max(1, Math.floor(duration * (1 - target.stats.speed * 0.1)))
      break
  }

  return { value, duration }
}

export function calculateEnemyStats(_baseStats: EntityStats, _enemyLevel: number): EntityStats {
  return {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    attack: 10,
    defense: 5,
    level: 1,
    experience: 0,
    speed: 5,
    criticalChance: 0.05,
    criticalDamage: 1.5,
    attributePoints: 0,
    bonuses: [],
    statusEffects: []
  }
}

import type { Entity, Position, CharacterClass } from '../types'
import type { Skill, SkillEffect, SkillUseResult, TargetSelectionResult } from '../types/skills'
import type { MapTile } from '../types/map'
import type { StatusEffect } from '../types/status'

// 技能数据库
const SKILL_DATABASE: Record<string, Skill> = {
  // 战士技能
  slash: {
    id: 'slash',
    name: '横扫',
    description: '对目标区域内的敌人造成伤害',
    type: 'attack',
    targetType: 'area',
    range: 1,
    area: 2,
    cooldown: 3,
    currentCooldown: 0,
    manaCost: 10,
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
  },
  shield_bash: {
    id: 'shield_bash',
    name: '盾击',
    description: '对单个目标造成伤害并眩晕',
    type: 'attack',
    targetType: 'single',
    range: 1,
    cooldown: 4,
    currentCooldown: 0,
    manaCost: 15,
    effects: [
      {
        type: 'damage',
        value: 10,
        statusEffects: [
          {
            type: 'stun',
            value: 0,
            duration: 2
          }
        ]
      }
    ],
    requirements: {
      class: ['warrior'],
      level: 3
    }
  },

  // 法师技能
  fireball: {
    id: 'fireball',
    name: '火球术',
    description: '发射一个火球，造成范围伤害和燃烧效果',
    type: 'attack',
    targetType: 'area',
    range: 4,
    area: 2,
    cooldown: 3,
    currentCooldown: 0,
    manaCost: 20,
    effects: [
      {
        type: 'damage',
        value: 20,
        statusEffects: [
          {
            type: 'burn',
            value: 5,
            duration: 3
          }
        ]
      }
    ],
    requirements: {
      class: ['mage'],
      level: 1
    }
  },
  ice_nova: {
    id: 'ice_nova',
    name: '冰霜新星',
    description: '释放冰霜能量，减速周围敌人',
    type: 'attack',
    targetType: 'area',
    range: 0,
    area: 3,
    cooldown: 5,
    currentCooldown: 0,
    manaCost: 25,
    effects: [
      {
        type: 'damage',
        value: 15,
        statusEffects: [
          {
            type: 'slow',
            value: 0.5,
            duration: 2
          }
        ]
      }
    ],
    requirements: {
      class: ['mage'],
      level: 3
    }
  },

  // 盗贼技能
  backstab: {
    id: 'backstab',
    name: '背刺',
    description: '对单个目标造成高额伤害',
    type: 'attack',
    targetType: 'single',
    range: 1,
    cooldown: 4,
    currentCooldown: 0,
    manaCost: 15,
    effects: [
      {
        type: 'damage',
        value: 30
      }
    ],
    requirements: {
      class: ['rogue'],
      level: 1
    }
  },
  poison_strike: {
    id: 'poison_strike',
    name: '毒击',
    description: '对目标造成伤害并施加中毒效果',
    type: 'attack',
    targetType: 'single',
    range: 1,
    cooldown: 3,
    currentCooldown: 0,
    manaCost: 20,
    effects: [
      {
        type: 'damage',
        value: 15,
        statusEffects: [
          {
            type: 'poison',
            value: 8,
            duration: 3
          }
        ]
      }
    ],
    requirements: {
      class: ['rogue'],
      level: 3
    }
  }
}

// 获取技能
export function getSkill(skillId: string): Skill | null {
  return SKILL_DATABASE[skillId] || null
}

// 获取职业技能列表
export function getClassSkills(characterClass: CharacterClass, level: number): Skill[] {
  return Object.values(SKILL_DATABASE).filter(
    skill =>
      skill.requirements?.class?.includes(characterClass) &&
      (!skill.requirements.level || skill.requirements.level <= level)
  )
}

// 检查技能是否可用
export function canUseSkill(entity: Entity, skill: Skill): boolean {
  // 检查冷却时间
  if (skill.currentCooldown && skill.currentCooldown > 0) return false

  // 检查魔法值
  if (entity.stats.mana < skill.manaCost) return false

  // 检查等级要求
  if (skill.requirements?.level && entity.stats.level < skill.requirements.level) return false

  // 检查职业要求
  if (
    skill.requirements?.class &&
    !skill.requirements.class.includes(entity.class as CharacterClass)
  )
    return false

  return true
}

// 获取技能目标
export function getSkillTargets(
  skill: Skill,
  source: Entity,
  target: Position,
  map: MapTile[][],
  entities: Entity[]
): TargetSelectionResult {
  const result: TargetSelectionResult = {
    valid: false,
    targets: [],
    positions: []
  }

  // 检查距离
  const distance = Math.abs(source.position.x - target.x) + Math.abs(source.position.y - target.y)
  if (distance > skill.range) return result

  switch (skill.targetType) {
    case 'self':
      result.valid = true
      result.targets = [source]
      result.positions = [source.position]
      break

    case 'single':
      const targetEntity = entities.find(
        e => e.position.x === target.x && e.position.y === target.y
      )
      if (targetEntity && targetEntity !== source) {
        result.valid = true
        result.targets = [targetEntity]
        result.positions = [target]
      }
      break

    case 'area':
      const area = skill.area || 1
      const targets: Entity[] = []
      const positions: Position[] = []

      for (let y = target.y - area; y <= target.y + area; y++) {
        for (let x = target.x - area; x <= target.x + area; x++) {
          if (
            x >= 0 &&
            x < map[0].length &&
            y >= 0 &&
            y < map.length &&
            map[y][x].type === 'floor'
          ) {
            positions.push({ x, y })
            const entity = entities.find(e => e.position.x === x && e.position.y === y)
            if (entity && entity !== source) {
              targets.push(entity)
            }
          }
        }
      }

      if (targets.length > 0) {
        result.valid = true
        result.targets = targets
        result.positions = positions
      }
      break

    case 'line':
      const dx = target.x - source.position.x
      const dy = target.y - source.position.y
      const steps = Math.max(Math.abs(dx), Math.abs(dy))
      const stepX = dx / steps
      const stepY = dy / steps

      const lineTargets: Entity[] = []
      const linePositions: Position[] = []

      for (let i = 1; i <= steps; i++) {
        const x = Math.round(source.position.x + stepX * i)
        const y = Math.round(source.position.y + stepY * i)

        if (x >= 0 && x < map[0].length && y >= 0 && y < map.length && map[y][x].type === 'floor') {
          linePositions.push({ x, y })
          const entity = entities.find(e => e.position.x === x && e.position.y === y)
          if (entity && entity !== source) {
            lineTargets.push(entity)
          }
        } else {
          break // 遇到墙壁停止
        }
      }

      if (lineTargets.length > 0) {
        result.valid = true
        result.targets = lineTargets
        result.positions = linePositions
      }
      break
  }

  return result
}

// 使用技能
export function useSkill(source: Entity, skill: Skill, targets: Entity[]): SkillUseResult {
  const result: SkillUseResult = {
    success: false,
    targets: [],
    effects: []
  }

  // 检查技能是否可用
  if (!canUseSkill(source, skill)) {
    result.message = '技能无法使用'
    return result
  }

  // 消耗魔法值
  source.stats.mana -= skill.manaCost

  // 设置冷却时间
  skill.currentCooldown = skill.cooldown

  // 应用技能效果
  targets.forEach(target => {
    skill.effects.forEach(effect => {
      const appliedEffect = applySkillEffect(source, target, effect)
      result.effects.push({
        target,
        effect,
        value: appliedEffect
      })
    })
  })

  result.success = true
  result.targets = targets
  return result
}

// 应用技能效果
function applySkillEffect(source: Entity, target: Entity, effect: SkillEffect): number {
  let value = effect.value

  switch (effect.type) {
    case 'damage':
      // 计算伤害
      value = Math.max(1, value + source.stats.attack - target.stats.defense)
      target.stats.health -= value

      // 应用状态效果
      effect.statusEffects?.forEach(statusEffect => {
        target.stats.statusEffects = target.stats.statusEffects || []
        target.stats.statusEffects.push({
          ...statusEffect,
          remainingDuration: statusEffect.duration
        })
      })
      break

    case 'heal':
      value = Math.min(target.stats.maxHealth - target.stats.health, value)
      target.stats.health += value
      break

    case 'buff':
      target.stats.bonuses.push({
        type: 'attack',
        value: effect.value,
        duration: effect.duration
      })
      break

    case 'debuff':
      target.stats.bonuses.push({
        type: 'defense',
        value: -effect.value,
        duration: effect.duration
      })
      break
  }

  return value
}

// 更新技能冷却时间
export function updateSkillCooldowns(skills: Skill[]): void {
  skills.forEach(skill => {
    if (skill.currentCooldown && skill.currentCooldown > 0) {
      skill.currentCooldown--
    }
  })
}

// 更新状态效果
export function updateStatusEffects(entity: Entity): void {
  if (!entity.stats.statusEffects) return

  entity.stats.statusEffects = entity.stats.statusEffects.filter(status => {
    if (status.remainingDuration === undefined) return false

    status.remainingDuration--
    if (status.remainingDuration <= 0) {
      return false
    }

    // 应用持续效果
    switch (status.type) {
      case 'poison':
      case 'burn':
        entity.stats.health -= status.value
        break
      case 'slow':
        entity.stats.speed = Math.floor(entity.stats.speed * (1 - status.value))
        break
      case 'haste':
        entity.stats.speed = Math.floor(entity.stats.speed * (1 + status.value))
        break
    }

    return true
  })
}

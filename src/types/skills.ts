import type { Position } from './position'
import type { StatusEffect } from './status'
import type { Entity } from './entity'

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff'
  value: number
  duration?: number
  statusEffects?: StatusEffect[]
}

export interface Skill {
  id: string
  name: string
  description: string
  manaCost: number
  cooldown: number
  currentCooldown: number
  range: number
  effects: SkillEffect[]
  type: 'attack' | 'support' | 'utility'
  damage?: number
  targetType: 'self' | 'single' | 'area' | 'line'
  area?: number
  requirements?: {
    class?: string[]
    level?: number
  }
}

export interface SkillState {
  selectedSkill: Skill | null
  availableSkills: Skill[]
  skillTargets: Position[]
}

export interface SkillUseResult {
  success: boolean
  targets: Entity[]
  effects: {
    target: Entity
    effect: SkillEffect
    value: number
  }[]
  message?: string
}

export interface TargetSelectionResult {
  valid: boolean
  targets: Entity[]
  positions: Position[]
}

export type { Position }

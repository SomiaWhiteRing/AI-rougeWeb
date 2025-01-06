// 状态效果类型
export type StatusEffectType = 'poison' | 'burn' | 'stun' | 'slow' | 'haste' | 'shield'

// 属性加成类型
export type StatBonusType = 'attack' | 'defense' | 'speed' | 'criticalChance' | 'criticalDamage'

// 状态效果
export interface StatusEffect {
  type: StatusEffectType
  value: number
  duration: number
  remainingDuration: number
}

// 属性加成
export interface StatBonus {
  type: StatBonusType
  value: number
  duration?: number
}

// 技能效果
export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff'
  value: number
  duration?: number
  range?: number
  statusEffects?: StatusEffect[]
}

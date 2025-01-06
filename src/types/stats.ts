import type { StatusEffect } from './status'
import type { Bonus } from './bonus'

export interface EntityStats {
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  attack: number
  defense: number
  level: number
  experience: number
  speed: number
  criticalChance: number
  criticalDamage: number
  attributePoints: number
  bonuses: Bonus[]
  statusEffects: StatusEffect[]
}

export type CharacterStats = EntityStats

export type { StatusEffect, Bonus }

import type { Position } from './position'
import type { Skill } from './skills'
import type { Item, EquipmentSlots } from './items'
import type { EntityStats } from './stats'

export type EntityType = 'player' | 'enemy' | 'item'
export type CharacterClass = 'warrior' | 'mage' | 'rogue'

export interface Entity {
  type: EntityType
  class?: CharacterClass
  position: Position
  stats: EntityStats
  skills?: Skill[]
  inventory?: Item[]
  equipment?: EquipmentSlots
}

export interface Character extends Entity {
  type: 'player'
  class: CharacterClass
  inventory: Item[]
  equipment: EquipmentSlots
}

export type { Position, Skill, Item, EntityStats }

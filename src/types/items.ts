import type { CharacterClass } from './entity'

// 物品类型
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable'

// 物品稀有度
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

// 装备槽位
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'

// 物品属性
export interface ItemBonus {
  [key: string]: number
}

// 基础物品
export interface BaseItem {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  value: number
  level?: number
}

// 装备
export interface Equipment extends BaseItem {
  type: 'weapon' | 'armor' | 'accessory'
  slot: EquipmentSlot
  bonuses: ItemBonus[]
  level: number
  requirements?: {
    level?: number
    class?: CharacterClass[]
  }
}

// 消耗品
export interface Consumable extends BaseItem {
  type: 'consumable'
  bonuses: Array<{
    [key: string]: number
    duration?: number
  }>
  quantity: number
}

// 物品联合类型
export type Item = Equipment | Consumable

// 类型守卫
export function isEquipment(item: Item): item is Equipment {
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory'
}

export function isConsumable(item: Item): item is Consumable {
  return item.type === 'consumable'
}

// 装备栏
export interface EquipmentSlots {
  weapon?: Equipment
  armor?: Equipment
  accessory?: Equipment
}

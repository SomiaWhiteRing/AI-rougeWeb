import type { Item, Equipment, Consumable, EquipmentSlot, EquipmentSlots } from '../types/items'
import type { Character } from '../types/entity'

// 物品掉落配置类型
interface ItemDropConfig {
  itemId: string
  levelRange: {
    min: number
    max: number
  }
  weight: number
}

// 物品数据库
const ITEM_DATABASE: Record<string, Item> = {
  // 武器
  sword: {
    id: 'sword',
    name: '铁剑',
    description: '普通的铁剑',
    rarity: 'common',
    value: 100,
    type: 'weapon',
    slot: 'weapon',
    bonuses: [{ attack: 5 }],
    level: 1
  },
  // 防具
  leather_armor: {
    id: 'leather_armor',
    name: '皮甲',
    description: '普通的皮甲',
    rarity: 'common',
    value: 100,
    type: 'armor',
    slot: 'armor',
    bonuses: [{ defense: 3 }],
    level: 1
  },
  // 饰品
  ring: {
    id: 'ring',
    name: '戒指',
    description: '普通的戒指',
    rarity: 'common',
    value: 100,
    type: 'accessory',
    slot: 'accessory',
    bonuses: [{ criticalChance: 0.05 }],
    level: 1
  },
  // 消耗品
  health_potion: {
    id: 'health_potion',
    name: '生命药水',
    description: '恢复少量生命值',
    rarity: 'common',
    value: 50,
    type: 'consumable',
    bonuses: [{ health: 20 }],
    quantity: 1
  }
}

// 物品掉落表
const ITEM_DROP_TABLE: ItemDropConfig[] = [
  {
    itemId: 'sword',
    levelRange: { min: 1, max: 5 },
    weight: 10
  },
  {
    itemId: 'leather_armor',
    levelRange: { min: 1, max: 5 },
    weight: 10
  },
  {
    itemId: 'ring',
    levelRange: { min: 1, max: 5 },
    weight: 5
  },
  {
    itemId: 'health_potion',
    levelRange: { min: 1, max: 99 },
    weight: 20
  }
]

// 生成随机物品
export function generateRandomItem(level: number): Item | null {
  // 筛选符合等级范围的物品
  const availableItems = ITEM_DROP_TABLE.filter(
    (config: ItemDropConfig) => level >= config.levelRange.min && level <= config.levelRange.max
  )

  if (availableItems.length === 0) return null

  // 计算总权重
  const totalWeight = availableItems.reduce(
    (sum: number, item: ItemDropConfig) => sum + item.weight,
    0
  )

  // 随机选择物品
  let randomWeight = Math.random() * totalWeight
  for (const config of availableItems) {
    randomWeight -= config.weight
    if (randomWeight <= 0) {
      const baseItem = ITEM_DATABASE[config.itemId]
      if (!baseItem) return null
      const item = { ...baseItem }
      if ('quantity' in item) {
        item.quantity = 1
      }
      return item
    }
  }

  return null
}

// 装备物品
export function equipItem(character: Character, item: Equipment, slot: EquipmentSlot): boolean {
  // 检查物品类型是否匹配槽位
  if (item.type === 'weapon' && slot !== 'weapon') return false
  if (item.type === 'armor' && slot !== 'armor') return false
  if (item.type === 'accessory' && slot !== 'accessory') return false

  // 检查等级要求
  if (item.level > character.stats.level) return false

  // 移除旧装备的加成
  const equipment = character.equipment as EquipmentSlots | undefined
  if (equipment?.[slot]) {
    const oldItem = equipment[slot]
    if (oldItem) {
      character.stats.bonuses = character.stats.bonuses.filter(
        bonus => !oldItem.bonuses.includes(bonus)
      )
    }
  }

  // 装备新物品
  if (!character.equipment) {
    character.equipment = {
      weapon: undefined,
      armor: undefined,
      accessory: undefined
    } as EquipmentSlots
  }

  const newEquipment = character.equipment as EquipmentSlots
  newEquipment[slot] = item

  // 添加新装备的加成
  character.stats.bonuses.push(...item.bonuses)

  return true
}

// 卸下装备
export function unequipItem(character: Character, slot: EquipmentSlot): Equipment | null {
  const equipment = character.equipment as EquipmentSlots | undefined
  if (!equipment?.[slot]) return null

  const item = equipment[slot]
  if (!item) return null

  // 移除装备加成
  character.stats.bonuses = character.stats.bonuses.filter(bonus => !item.bonuses.includes(bonus))

  // 移除装备
  equipment[slot] = undefined

  return item
}

// 使用消耗品
export function useConsumable(character: Character, item: Consumable): boolean {
  if (item.type !== 'consumable' || !item.quantity || item.quantity <= 0) return false

  // 应用效果
  item.bonuses.forEach(bonus => {
    if (bonus.health) {
      character.stats.health = Math.min(
        character.stats.health + bonus.health,
        character.stats.maxHealth
      )
    }
    if (bonus.duration) {
      character.stats.bonuses.push(bonus)

      // 设置定时器移除临时效果
      setTimeout(() => {
        character.stats.bonuses = character.stats.bonuses.filter(b => b !== bonus)
      }, bonus.duration * 1000)
    }
  })

  // 减少物品数量
  item.quantity--

  return true
}

// 合并相同的可堆叠物品
export function mergeItems(items: Item[]): Item[] {
  const mergedItems: Record<string, Item> = {}

  for (const item of items) {
    if ('quantity' in item && item.quantity) {
      if (mergedItems[item.id]) {
        const existingItem = mergedItems[item.id]
        if ('quantity' in existingItem && existingItem.quantity) {
          existingItem.quantity += item.quantity
        }
      } else {
        mergedItems[item.id] = { ...item }
      }
    } else {
      // 不可堆叠物品保持原样
      mergedItems[`${item.id}-${Math.random()}`] = item
    }
  }

  return Object.values(mergedItems)
}

// 获取物品稀有度颜色
export function getRarityColor(item: Item): string {
  switch (item.rarity) {
    case 'common':
      return '#ffffff'
    case 'uncommon':
      return '#1eff00'
    case 'rare':
      return '#0070dd'
    case 'epic':
      return '#a335ee'
    case 'legendary':
      return '#ff8000'
    default:
      return '#ffffff'
  }
}

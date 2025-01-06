<template>
  <div class="inventory">
    <div class="equipment-slots">
      <div
        v-for="(item, slot) in equipmentSlots"
        :key="slot"
        class="equipment-slot"
        @click="handleUnequip(slot as EquipmentSlot)"
      >
        <div class="slot-label">{{ getSlotLabel(slot as EquipmentSlot) }}</div>
        <div class="slot-content" :class="{ empty: !item }">
          {{ item ? item.name : '空' }}
        </div>
      </div>
    </div>

    <div class="inventory-grid">
      <div
        v-for="(item, index) in inventory"
        :key="index"
        class="inventory-slot"
        @click="handleItemClick(item)"
      >
        <div class="item-name" :class="item.rarity">{{ item.name }}</div>
        <div class="item-description">{{ item.description }}</div>
        <div v-if="isConsumable(item)" class="item-quantity">x{{ item.quantity }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Equipment, EquipmentSlot, Consumable, Item, EquipmentSlots } from '../types/items'

const props = defineProps<{
  inventory: Item[]
  equipmentSlots: EquipmentSlots
}>()

const emit = defineEmits<{
  (e: 'equip', item: Equipment, slot: EquipmentSlot): void
  (e: 'unequip', slot: EquipmentSlot): void
  (e: 'use', item: Consumable): void
}>()

const getSlotLabel = (slot: EquipmentSlot) => {
  switch (slot) {
    case 'weapon':
      return '武器'
    case 'armor':
      return '护甲'
    case 'accessory':
      return '饰品'
    default:
      return slot
  }
}

const handleItemClick = (item: Item) => {
  if (isEquipment(item)) {
    emit('equip', item, item.slot)
  } else if (isConsumable(item)) {
    emit('use', item)
  }
}

const handleUnequip = (slot: EquipmentSlot) => {
  if (props.equipmentSlots[slot]) {
    emit('unequip', slot)
  }
}

const isEquipment = (item: Item): item is Equipment => {
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory'
}

const isConsumable = (item: Item): item is Consumable => {
  return item.type === 'consumable'
}
</script>

<style scoped>
.inventory {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  color: #ffffff;
}

.equipment-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.equipment-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: #3a3a3a;
  border-radius: 0.25rem;
  cursor: pointer;
}

.slot-label {
  font-size: 0.8rem;
  color: #aaaaaa;
  margin-bottom: 0.25rem;
}

.slot-content {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  background-color: #4a4a4a;
  border-radius: 0.25rem;
}

.slot-content.empty {
  color: #666666;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.inventory-slot {
  padding: 0.5rem;
  background-color: #3a3a3a;
  border-radius: 0.25rem;
  cursor: pointer;
}

.inventory-slot:hover {
  background-color: #4a4a4a;
}

.item-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.item-name.common {
  color: #ffffff;
}

.item-name.uncommon {
  color: #00ff00;
}

.item-name.rare {
  color: #0088ff;
}

.item-name.epic {
  color: #aa00ff;
}

.item-name.legendary {
  color: #ffaa00;
}

.item-description {
  font-size: 0.8rem;
  color: #aaaaaa;
  margin-bottom: 0.25rem;
}

.item-quantity {
  font-size: 0.8rem;
  color: #888888;
  text-align: right;
}
</style>

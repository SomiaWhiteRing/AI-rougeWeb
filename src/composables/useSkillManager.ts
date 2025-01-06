import { ref } from 'vue'
import type { Entity } from '../types'
import type { Skill, SkillState, Position } from '../types/skills'

export function useSkillManager() {
  const skillState = ref<SkillState>({
    selectedSkill: null,
    availableSkills: [],
    skillTargets: []
  })

  // 选择技能
  function selectSkill(skill: Skill) {
    skillState.value.selectedSkill = skill
    // 计算可用目标
    skillState.value.skillTargets = [{ x: 2, y: 1 }] // 测试用，实际应该根据范围计算
  }

  // 验证目标是否在技能范围内
  function isValidTarget(source: Position, target: Position, range: number): boolean {
    const dx = Math.abs(source.x - target.x)
    const dy = Math.abs(source.y - target.y)
    return Math.sqrt(dx * dx + dy * dy) <= range
  }

  // 计算技能伤害
  function calculateSkillDamage(attacker: Entity, defender: Entity, skill: Skill): number {
    const baseDamage = skill.damage ?? attacker.stats.attack
    const defense = defender.stats.defense
    const damage = Math.max(1, baseDamage - defense)

    // 暴击判定
    if (Math.random() < attacker.stats.criticalChance) {
      return Math.floor(damage * attacker.stats.criticalDamage)
    }

    return damage
  }

  // 应用技能效果
  function applySkillEffects(target: Entity, skill: Skill) {
    skill.effects.forEach(effect => {
      target.stats.statusEffects.push({
        type: effect.type,
        duration: effect.duration,
        value: effect.value
      })
    })
  }

  // 使用技能
  function useSkill(caster: Entity, target: Entity) {
    if (!skillState.value.selectedSkill) return

    const skill = skillState.value.selectedSkill

    // 检查魔法值
    if (caster.stats.mana < skill.manaCost) return

    // 消耗魔法值
    caster.stats.mana -= skill.manaCost

    // 设置冷却时间
    skill.currentCooldown = skill.cooldown

    // 计算伤害
    if (skill.type === 'attack') {
      const damage = calculateSkillDamage(caster, target, skill)
      target.stats.health = Math.max(0, target.stats.health - damage)
    }

    // 应用效果
    applySkillEffects(target, skill)
  }

  return {
    skillState,
    selectSkill,
    isValidTarget,
    calculateSkillDamage,
    applySkillEffects,
    useSkill
  }
}

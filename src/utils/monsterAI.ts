import type { Entity } from '../types/entity'
import type { Position } from '../types/position'
import type { MapTile } from '../types/map'

interface AIAction {
  type: 'move' | 'attack'
  position: Position
}

// 计算两点之间的距离
function calculateDistance(a: Position, b: Position): number {
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)
  return Math.sqrt(dx * dx + dy * dy)
}

// 获取可能的移动方向
function getPossibleMoves(position: Position, map: MapTile[][]): Position[] {
  const moves: Position[] = []
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 }, // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 } // 右
  ]

  directions.forEach(dir => {
    const newPos = {
      x: position.x + dir.x,
      y: position.y + dir.y
    }

    // 检查是否在地图范围内且可行走
    if (
      newPos.y >= 0 &&
      newPos.y < map.length &&
      newPos.x >= 0 &&
      newPos.x < map[0].length &&
      map[newPos.y][newPos.x].walkable
    ) {
      moves.push(newPos)
    }
  })

  return moves
}

// 处理怪物AI
export function handleMonsterAI(monster: Entity, player: Entity, map: MapTile[][]): AIAction {
  const distance = calculateDistance(monster.position, player.position)

  // 如果玩家在攻击范围内，直接攻击
  if (distance <= 1) {
    return {
      type: 'attack',
      position: player.position
    }
  }

  // 否则尝试向玩家移动
  const possibleMoves = getPossibleMoves(monster.position, map)
  if (possibleMoves.length === 0) {
    return {
      type: 'move',
      position: monster.position // 原地不动
    }
  }

  // 选择最接近玩家的移动位置
  let bestMove = possibleMoves[0]
  let minDistance = calculateDistance(bestMove, player.position)

  possibleMoves.forEach(move => {
    const dist = calculateDistance(move, player.position)
    if (dist < minDistance) {
      minDistance = dist
      bestMove = move
    }
  })

  return {
    type: 'move',
    position: bestMove
  }
}

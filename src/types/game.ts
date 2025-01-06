import type { Entity } from './entity'
import type { MapTile } from './map'

export type GameStatus = 'playing' | 'victory' | 'gameover'

export interface GameState {
  player: Entity
  enemies: Entity[]
  map: MapTile[][]
  turn: number
  score: number
  gameStatus: GameStatus
  messages: string[]
  isPlayerTurn: boolean
} 
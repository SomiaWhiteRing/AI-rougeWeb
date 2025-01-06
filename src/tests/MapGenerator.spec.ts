import { describe, it, expect } from 'vitest'
import { generateMap } from '../utils/mapGenerator'
import type { MapConfig } from '../types/map'

describe('MapGenerator', () => {
  it('should generate a map with specified dimensions', () => {
    const config: MapConfig = {
      width: 50,
      height: 30,
      minRooms: 3,
      maxRooms: 5,
      minRoomSize: 5,
      maxRoomSize: 10
    }

    const result = generateMap(config)
    expect(result.map.length).toBe(config.height)
    expect(result.map[0].length).toBe(config.width)
  })

  it('should generate a map with walkable tiles', () => {
    const config: MapConfig = {
      width: 50,
      height: 30,
      minRooms: 3,
      maxRooms: 5,
      minRoomSize: 5,
      maxRoomSize: 10
    }

    const result = generateMap(config)
    let hasWalkableTile = false

    for (let y = 0; y < result.map.length; y++) {
      for (let x = 0; x < result.map[y].length; x++) {
        if (result.map[y][x].walkable) {
          hasWalkableTile = true
          break
        }
      }
      if (hasWalkableTile) break
    }

    expect(hasWalkableTile).toBe(true)
  })

  it('should generate a map with stairs', () => {
    const config: MapConfig = {
      width: 50,
      height: 30,
      minRooms: 3,
      maxRooms: 5,
      minRoomSize: 5,
      maxRoomSize: 10
    }

    const result = generateMap(config)
    let hasStairs = false

    for (let y = 0; y < result.map.length; y++) {
      for (let x = 0; x < result.map[y].length; x++) {
        if (result.map[y][x].type === ('stairs' as const)) {
          hasStairs = true
          break
        }
      }
      if (hasStairs) break
    }

    expect(hasStairs).toBe(true)
  })
})

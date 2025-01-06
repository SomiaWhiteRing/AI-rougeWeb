import type { MapTile, MapConfig, Room } from '../types/map'

interface GeneratedMap {
  map: MapTile[][]
  rooms: Room[]
}

// 生成地图
export function generateMap(config: MapConfig): GeneratedMap {
  const { width, height, minRooms, maxRooms, minRoomSize, maxRoomSize } = config
  console.log('Generating map with config:', config)

  // 初始化地图，全部填充为墙
  const map: MapTile[][] = Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(() => ({
          type: 'wall',
          walkable: false
        }))
    )

  // 生成房间
  const rooms: Room[] = []
  const numRooms = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms
  console.log('Attempting to generate', numRooms, 'rooms')

  let attempts = 0
  const maxAttempts = numRooms * 10 // 每个房间最多尝试10次

  while (rooms.length < numRooms && attempts < maxAttempts) {
    attempts++

    // 生成房间尺寸
    const roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize
    const roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize

    // 生成房间位置（确保有1格边界）
    const x = Math.floor(Math.random() * (width - roomWidth - 2)) + 1
    const y = Math.floor(Math.random() * (height - roomHeight - 2)) + 1

    // 检查是否与其他房间重叠
    let overlaps = false
    for (const room of rooms) {
      if (
        x <= room.x + room.width + 1 &&
        x + roomWidth + 1 >= room.x &&
        y <= room.y + room.height + 1 &&
        y + roomHeight + 1 >= room.y
      ) {
        overlaps = true
        break
      }
    }

    if (!overlaps) {
      // 创建房间
      const room: Room = {
        x,
        y,
        width: roomWidth,
        height: roomHeight
      }
      rooms.push(room)
      console.log('Created room:', room)

      // 在地图上标记房间
      for (let dy = 0; dy < roomHeight; dy++) {
        for (let dx = 0; dx < roomWidth; dx++) {
          if (y + dy < height && x + dx < width) {
            map[y + dy][x + dx] = {
              type: 'floor',
              walkable: true
            }
          }
        }
      }
    }
  }

  console.log('Generated', rooms.length, 'rooms after', attempts, 'attempts')

  // 确保至少有一个房间
  if (rooms.length === 0) {
    console.log('No rooms generated, creating default room')
    const room: Room = {
      x: 1,
      y: 1,
      width: minRoomSize,
      height: minRoomSize
    }
    rooms.push(room)

    // 在地图上标记房间
    for (let dy = 0; dy < minRoomSize; dy++) {
      for (let dx = 0; dx < minRoomSize; dx++) {
        if (1 + dy < height && 1 + dx < width) {
          map[1 + dy][1 + dx] = {
            type: 'floor',
            walkable: true
          }
        }
      }
    }
  }

  // 连接房间
  for (let i = 0; i < rooms.length - 1; i++) {
    const room1 = rooms[i]
    const room2 = rooms[i + 1]

    // 获取房间中心点
    const x1 = Math.floor(room1.x + room1.width / 2)
    const y1 = Math.floor(room1.y + room1.height / 2)
    const x2 = Math.floor(room2.x + room2.width / 2)
    const y2 = Math.floor(room2.y + room2.height / 2)

    console.log('Connecting rooms:', {
      from: { x: x1, y: y1 },
      to: { x: x2, y: y2 }
    })

    // 创建走廊
    if (Math.random() < 0.5) {
      createHorizontalTunnel(x1, x2, y1, map)
      createVerticalTunnel(y1, y2, x2, map)
    } else {
      createVerticalTunnel(y1, y2, x1, map)
      createHorizontalTunnel(x1, x2, y2, map)
    }
  }

  // 添加楼梯
  const lastRoom = rooms[rooms.length - 1]
  const stairsX = Math.floor(lastRoom.x + lastRoom.width / 2)
  const stairsY = Math.floor(lastRoom.y + lastRoom.height / 2)
  if (stairsY < height && stairsX < width) {
    map[stairsY][stairsX] = {
      type: 'stairs' as const,
      walkable: true
    }
  }

  // 验证地图
  const walkableTiles = map.flat().filter(tile => tile.walkable).length
  console.log('Map validation:', {
    dimensions: { width, height },
    rooms: rooms.length,
    walkableTiles,
    firstRoom: rooms[0]
  })

  return { map, rooms }
}

// 创建水平走廊
function createHorizontalTunnel(x1: number, x2: number, y: number, map: MapTile[][]) {
  const start = Math.min(x1, x2)
  const end = Math.max(x1, x2)
  for (let x = start; x <= end; x++) {
    map[y][x] = {
      type: 'floor',
      walkable: true
    }
  }
}

// 创建垂直走廊
function createVerticalTunnel(y1: number, y2: number, x: number, map: MapTile[][]) {
  const start = Math.min(y1, y2)
  const end = Math.max(y1, y2)
  for (let y = start; y <= end; y++) {
    map[y][x] = {
      type: 'floor',
      walkable: true
    }
  }
}

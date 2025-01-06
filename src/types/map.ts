// 地图瓦片类型
export type TileType = 'wall' | 'floor' | 'stairs' | 'door' | 'trap'

// 地图瓦片
export interface MapTile {
  type: 'floor' | 'wall' | 'door' | 'stairs'
  walkable: boolean
}

// 房间类型
export interface Room {
  x: number
  y: number
  width: number
  height: number
}

// 地图生成配置
export interface MapConfig {
  width: number
  height: number
  minRooms: number
  maxRooms: number
  minRoomSize: number
  maxRoomSize: number
}

export interface MapState {
  map: MapTile[][]
  rooms: Room[]
  currentFloor: number
  fogOfWar: boolean
}

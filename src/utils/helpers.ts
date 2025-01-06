// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => {
      func.apply(this, args)
      timeout = null
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 深拷贝函数
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  const clonedObj = {} as T
  Object.keys(obj as object).forEach(key => {
    clonedObj[key as keyof T] = deepClone(obj[key as keyof T])
  })

  return clonedObj
}

// 随机整数生成函数
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 随机浮点数生成函数
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// 随机从数组中选择一个元素
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// 随机从数组中选择多个元素
export function randomChoices<T>(array: T[], count: number): T[] {
  const result: T[] = []
  const copy = [...array]
  for (let i = 0; i < count && copy.length > 0; i++) {
    const index = Math.floor(Math.random() * copy.length)
    result.push(copy[index])
    copy.splice(index, 1)
  }
  return result
}

// 洗牌数组
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 计算两点之间的距离
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// 计算两点之间的曼哈顿距离
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

// 格式化时间
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化数字（添加千位分隔符）
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// 检查对象是否为空
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试函数
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return retry(fn, retries - 1, delay)
  }
}

// 缓存函数结果
export function memoize<T extends (...args: unknown[]) => ReturnType<T>>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn.apply(this, args) as ReturnType<T>
    cache.set(key, result)
    return result
  } as T
}

// 限制函数调用频率
export function rateLimit<T extends (...args: unknown[]) => ReturnType<T>>(
  fn: T,
  limit: number,
  interval: number = 1000
): T {
  const calls: number[] = []

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now()
    calls.push(now)
    calls.splice(
      0,
      calls.findIndex(time => now - time <= interval)
    )

    if (calls.length <= limit) {
      return fn.apply(this, args) as ReturnType<T>
    }
    return undefined
  } as T
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target }

  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof T
      if (typeof source[sourceKey] === 'object' && source[sourceKey] !== null) {
        if (!(sourceKey in target)) {
          Object.assign(output, { [sourceKey]: source[sourceKey] })
        } else {
          output[sourceKey] = deepMerge(
            target[sourceKey] as object,
            source[sourceKey] as object
          ) as T[keyof T]
        }
      } else {
        Object.assign(output, { [sourceKey]: source[sourceKey] })
      }
    })
  }
  return output
}

export function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1 as object)
  const keys2 = Object.keys(obj2 as object)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    const typedKey = key as keyof T
    if (!deepEqual(obj1[typedKey], obj2[typedKey])) {
      return false
    }
  }

  return true
}

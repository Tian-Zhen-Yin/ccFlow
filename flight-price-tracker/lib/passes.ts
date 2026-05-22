import type { FlightPass } from '@/lib/types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

/**
 * Read locally scraped flight pass data from the data/ directory.
 */
function readLocalPassData(): FlightPass[] | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'flight-passes.json')
    if (!existsSync(filePath)) return null

    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    const passes = parsed.passes as FlightPass[]

    if (Array.isArray(passes) && passes.length > 0) {
      console.log(`[passes] Loaded ${passes.length} flight passes from local data file`)
      return passes
    }
  } catch (err) {
    console.warn(`[passes] Failed to read local data: ${(err as Error).message}`)
  }

  return null
}

/**
 * Curated fallback data for airlines' 随心飞 products.
 * Updated periodically — will be overridden by local scraped data when available.
 */
function getCuratedPasses(): FlightPass[] {
  const now = new Date().toISOString()
  return [
    {
      airline: '南方航空',
      name: '畅游中国',
      price: '¥3,299起',
      validity: '有效期内不限次数',
      status: 'available',
      source: '南航官网',
      updatedAt: now,
      coverage: '全国航线',
      rules: '需提前5天兑换，单程最多3段未使用',
      originalPrice: '¥4,299',
    },
    {
      airline: '东方航空',
      name: '周末随心飞',
      price: '¥3,666',
      validity: '6个月',
      status: 'available',
      source: '东航APP',
      updatedAt: now,
      coverage: '国内航线（不含港澳台）',
      rules: '仅限周末航班，每次兑换需付税费',
      originalPrice: '¥4,888',
    },
    {
      airline: '中国国航',
      name: '随心飞·畅享版',
      price: '¥3,999',
      validity: '90天',
      status: 'available',
      source: '国航官网',
      updatedAt: now,
      coverage: '国航实际承运国内航线',
      rules: '不限次数，每次需付¥50手续费',
    },
    {
      airline: '海南航空',
      name: '海航随心飞',
      price: '¥2,999',
      validity: '半年',
      status: 'available',
      source: '海航官网',
      updatedAt: now,
      coverage: '海航系12家航司',
      rules: '提前3天兑换，同时最多4段未使用',
    },
    {
      airline: '春秋航空',
      name: '想飞就飞',
      price: '¥1,999起',
      validity: '3/6/12个月可选',
      status: 'available',
      source: '春秋航空',
      updatedAt: now,
      coverage: '春秋航空国内航线',
      rules: '分3个月/半年/一年套餐，提前7天兑换',
      originalPrice: '¥2,999',
    },
    {
      airline: '吉祥航空',
      name: '吉祥随心飞',
      price: '¥2,799',
      validity: '120天',
      status: 'available',
      source: '吉祥航空APP',
      updatedAt: now,
      coverage: '吉祥航空全部航线',
      rules: '不限次数，每次兑换需付¥20手续费',
    },
    {
      airline: '四川航空',
      name: '安逸飞',
      price: '¥2,899',
      validity: '4个月',
      status: 'available',
      source: '川航官网',
      updatedAt: now,
      coverage: '川航国内航线',
      rules: '每次仅可兑换一段，用完再兑',
    },
    {
      airline: '深圳航空',
      name: '深情飞',
      price: '¥2,999',
      validity: '90天',
      status: 'sold_out',
      source: '深航APP',
      updatedAt: now,
      coverage: '深航国内航线',
      rules: '限时限量发售',
    },
    {
      airline: '厦门航空',
      name: '畅享飞',
      price: '¥3,199',
      validity: '半年',
      status: 'available',
      source: '厦航官网',
      updatedAt: now,
      coverage: '厦航国内航线',
      rules: '提前5天兑换，最多4段未使用',
    },
    {
      airline: '华夏航空',
      name: '华夏随心飞',
      price: '¥2,599',
      validity: '120天',
      status: 'available',
      source: '华夏航空官网',
      updatedAt: now,
      coverage: '华夏航空支线网络',
      rules: '支线航班为主，提前3天兑换',
    },
  ]
}

export async function getFlightPasses(): Promise<FlightPass[]> {
  // Try local data first (from Puppeteer scraper)
  const localData = readLocalPassData()
  if (localData) return localData

  // Fall back to curated data
  return getCuratedPasses()
}

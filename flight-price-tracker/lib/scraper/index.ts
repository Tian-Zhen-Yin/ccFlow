import type { Flight, PriceRecord } from '@/lib/types'
import { toCtripCity } from './ctrip-city-map'
import { searchFlights, fetchLowestPrice, CtripApiError } from './ctrip-client'
import { parseFlights, parsePriceHistory } from './ctrip-parser'
import { TTLCache, CACHE_TTL_FLIGHTS, CACHE_TTL_PRICES } from './cache'
import { generateMockFlights, generateMockPriceHistory } from '@/lib/mock'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const flightCache = new TTLCache<Flight[]>(CACHE_TTL_FLIGHTS, 100)
const priceCache = new TTLCache<PriceRecord[]>(CACHE_TTL_PRICES, 100)

function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Read locally scraped flight data from the data/ directory.
 * Returns null if no local file exists.
 */
function readLocalFlightData(from: string, to: string, date: string): Flight[] | null {
  if (!isDev()) return null

  try {
    const filePath = path.join(process.cwd(), 'data', `flights-${from}-${to}-${date}.json`)
    if (!existsSync(filePath)) return null

    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    const flights = parsed.flights as Flight[]

    if (Array.isArray(flights) && flights.length > 0) {
      console.log(`[scraper] Loaded ${flights.length} flights from local data file`)
      return flights
    }
  } catch (err) {
    if (isDev()) {
      console.warn(`[scraper] Failed to read local flight data: ${(err as Error).message}`)
    }
  }

  return null
}

async function fetchRealFlights(
  from: string,
  to: string,
  date: string
): Promise<{ flights: Flight[] | null; priceHistory: PriceRecord[] | null }> {
  // Check local data directory first (dev-only, from Puppeteer scraper)
  const localFlights = readLocalFlightData(from, to, date)

  if (localFlights) {
    // Still try to fetch price history even when using local flight data
    const priceHistory = await fetchPriceHistory(from, to)
    return { flights: localFlights, priceHistory }
  }

  const fromCity = toCtripCity(from)
  const toCity = toCtripCity(to)

  if (!fromCity || !toCity) {
    return { flights: null, priceHistory: null }
  }

  const flightCacheKey = `flights:${fromCity.ctripCode}:${toCity.ctripCode}:${date}`
  const cachedFlights = flightCache.get(flightCacheKey)

  let flights: Flight[] | null = null

  // Try flight API
  if (!cachedFlights) {
    const flightResult = await searchFlights({
      dcity: fromCity.ctripCode,
      acity: toCity.ctripCode,
      dcityname: fromCity.cityName,
      acityname: toCity.cityName,
      date,
    }).then(res => {
      const parsed = parseFlights(res, date, from, to)
      if (parsed.length > 0) flightCache.set(flightCacheKey, parsed)
      return parsed
    }).catch((err) => {
      if (isDev() && err instanceof CtripApiError) {
        console.warn(`[scraper] Flight fetch failed: ${err.code} - ${err.message}`)
      }
      return null
    })

    if (Array.isArray(flightResult) && flightResult.length > 0) {
      flights = flightResult
    }
  } else {
    flights = cachedFlights
  }

  // Always try to fetch price history
  const priceHistory = await fetchPriceHistory(from, to)

  return { flights, priceHistory }
}

/**
 * Fetch price history for a route from Ctrip.
 */
async function fetchPriceHistory(from: string, to: string): Promise<PriceRecord[] | null> {
  const fromCity = toCtripCity(from)
  const toCity = toCtripCity(to)

  if (!fromCity || !toCity) return null

  const priceCacheKey = `prices:${fromCity.ctripCode}:${toCity.ctripCode}`
  const cachedPrices = priceCache.get(priceCacheKey)
  if (cachedPrices) return cachedPrices

  try {
    const res = await fetchLowestPrice(fromCity.ctripCode, toCity.ctripCode)
    const parsed = parsePriceHistory(res)
    if (parsed.length > 0) priceCache.set(priceCacheKey, parsed)
    return parsed.length > 0 ? parsed : null
  } catch (err) {
    if (isDev() && err instanceof CtripApiError) {
      console.warn(`[scraper] Price fetch failed: ${err.code} - ${err.message}`)
    }
    return null
  }
}

export async function getFlights(
  from: string,
  to: string,
  date: string
): Promise<{ flights: Flight[]; priceHistory: PriceRecord[] }> {
  const { flights, priceHistory } = await fetchRealFlights(from, to, date)

  return {
    flights: flights ?? generateMockFlights(from, to, date),
    priceHistory: priceHistory ?? generateMockPriceHistory(from, to),
  }
}

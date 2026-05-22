import type { Flight, PriceRecord } from '@/lib/types'

function safeGet(obj: unknown, path: string[]): unknown {
  let current: unknown = obj
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

function extractTime(datetimeStr: string): string {
  const match = datetimeStr.match(/(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

function computeDuration(departure: string, arrival: string): string {
  const dep = new Date(departure)
  const arr = new Date(arrival)
  if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return ''

  const diffMin = Math.round((arr.getTime() - dep.getTime()) / 60000)
  if (diffMin < 0) return ''

  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

interface CtripRoute {
  legs?: CtripLeg[]
}

interface CtripLeg {
  flight?: {
    airlineName?: string
    flightNumber?: string
    departureDate?: string
    arrivalDate?: string
    departureAirportInfo?: { airportName?: string; terminal?: string }
    arrivalAirportInfo?: { airportName?: string; terminal?: string }
    stopCount?: number
  }
  characteristic?: {
    lowestPrice?: number
  }
  cabins?: Array<{
    price?: { price?: number }
    discount?: string
  }>
}

export function parseFlights(
  response: unknown,
  searchDate: string,
  fromIATA: string,
  toIATA: string
): Flight[] {
  const routeList = safeGet(response, ['data', 'routeList']) as CtripRoute[] | undefined
  if (!Array.isArray(routeList)) return []

  const flights: Flight[] = []

  for (const route of routeList) {
    const leg = route.legs?.[0]
    if (!leg?.flight) continue

    const f = leg.flight
    const price = leg.characteristic?.lowestPrice
    if (!price || !f.flightNumber) continue

    const cabin = leg.cabins?.[0]
    const departAirport = [
      f.departureAirportInfo?.airportName ?? '',
      f.departureAirportInfo?.terminal ?? '',
    ].filter(Boolean).join(' ')

    const arriveAirport = [
      f.arrivalAirportInfo?.airportName ?? '',
      f.arrivalAirportInfo?.terminal ?? '',
    ].filter(Boolean).join(' ')

    flights.push({
      airline: f.airlineName ?? '',
      flightNo: f.flightNumber,
      departure: fromIATA,
      arrival: toIATA,
      departTime: f.departureDate ? extractTime(f.departureDate) : '',
      arriveTime: f.arrivalDate ? extractTime(f.arrivalDate) : '',
      duration: (f.departureDate && f.arrivalDate)
        ? computeDuration(f.departureDate, f.arrivalDate)
        : '',
      price: Math.round(price),
      discount: cabin?.discount ?? '',
      source: '携程',
      departAirport,
      arriveAirport,
      stops: f.stopCount ?? 0,
      date: searchDate,
    })
  }

  return flights.sort((a, b) => a.price - b.price)
}

export function parsePriceHistory(response: unknown): PriceRecord[] {
  const records: PriceRecord[] = []

  // New format: data.oneWayPrice[0] is { "YYYYMMDD": price, ... }
  const oneWayPrice = safeGet(response, ['data', 'oneWayPrice']) as
    | Record<string, number>[]
    | undefined

  if (Array.isArray(oneWayPrice) && oneWayPrice.length > 0 && typeof oneWayPrice[0] === 'object') {
    for (const [dateKey, price] of Object.entries(oneWayPrice[0])) {
      if (typeof price !== 'number' || price <= 0) continue
      const date = `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`
      records.push({
        date,
        minPrice: price,
        avgPrice: Math.round(price * 1.1),
      })
    }
    return records.sort((a, b) => a.date.localeCompare(b.date))
  }

  // Legacy format: data.priceList is [{ date, price }, ...]
  const priceList = safeGet(response, ['data', 'priceList']) as Array<{
    date?: string
    price?: number
  }> | undefined

  if (Array.isArray(priceList)) {
    for (const entry of priceList) {
      if (!entry.date || !entry.price) continue
      records.push({
        date: entry.date,
        minPrice: entry.price,
        avgPrice: Math.round(entry.price * 1.1),
      })
    }
    return records.sort((a, b) => a.date.localeCompare(b.date))
  }

  return []
}

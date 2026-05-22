import type { Flight, PriceRecord } from './types'

const airlines = [
  { name: '中国国航', code: 'CA' },
  { name: '东方航空', code: 'MU' },
  { name: '南方航空', code: 'CZ' },
  { name: '海南航空', code: 'HU' },
  { name: '厦门航空', code: 'MF' },
  { name: '深圳航空', code: 'ZH' },
  { name: '四川航空', code: '3U' },
  { name: '山东航空', code: 'SC' },
]

const sources = ['携程', '去哪儿', '飞猪', '同程']

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function generateFlightNo(airlineCode: string, seed: number): string {
  const num = 1000 + Math.floor(seededRandom(seed) * 9000)
  return `${airlineCode}${num}`
}

function generateTimes(seed: number): { depart: string; arrive: string; duration: string } {
  const departHour = 6 + Math.floor(seededRandom(seed) * 16)
  const departMin = Math.floor(seededRandom(seed + 1) * 4) * 15
  const durationHours = 1 + Math.floor(seededRandom(seed + 2) * 4)
  const durationMin = Math.floor(seededRandom(seed + 3) * 4) * 15

  const totalMin = departHour * 60 + departMin + durationHours * 60 + durationMin
  const arriveHour = Math.floor(totalMin / 60) % 24
  const arriveMin = totalMin % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    depart: `${pad(departHour)}:${pad(departMin)}`,
    arrive: `${pad(arriveHour)}:${pad(arriveMin)}`,
    duration: `${durationHours}h${durationMin > 0 ? ` ${durationMin}m` : ''}`,
  }
}

export function generateMockFlights(
  fromCode: string,
  toCode: string,
  date: string
): Flight[] {
  const baseSeed = hashString(`${fromCode}-${toCode}-${date}`)
  const flights: Flight[] = []
  const count = 8 + Math.floor(seededRandom(baseSeed) * 10)

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 137
    const airline = airlines[Math.floor(seededRandom(seed) * airlines.length)]
    const times = generateTimes(seed)
    const basePrice = 300 + Math.floor(seededRandom(seed + 10) * 1500)
    const source = sources[Math.floor(seededRandom(seed + 20) * sources.length)]
    const stops = seededRandom(seed + 30) > 0.7 ? 1 : 0
    const discount = Math.floor(seededRandom(seed + 40) * 5) + 1

    flights.push({
      airline: airline.name,
      flightNo: generateFlightNo(airline.code, seed + 50),
      departure: fromCode,
      arrival: toCode,
      departTime: times.depart,
      arriveTime: times.arrive,
      duration: times.duration,
      price: basePrice,
      discount: `${discount}`,
      source,
      departAirport: `${fromCode} T${Math.floor(seededRandom(seed + 60) * 3) + 1}`,
      arriveAirport: `${toCode} T${Math.floor(seededRandom(seed + 70) * 3) + 1}`,
      stops,
      date,
    })
  }

  return flights.sort((a, b) => a.price - b.price)
}

export function generateMockPriceHistory(
  fromCode: string,
  toCode: string
): PriceRecord[] {
  const baseSeed = hashString(`${fromCode}-${toCode}-history`)
  const records: PriceRecord[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const seed = baseSeed + i * 31
    const base = 500 + Math.floor(seededRandom(seed) * 1000)
    const variance = Math.floor(seededRandom(seed + 1) * 200) - 100

    records.push({
      date: dateStr,
      minPrice: Math.max(200, base - Math.abs(variance)),
      avgPrice: base + Math.floor(seededRandom(seed + 2) * 150),
    })
  }

  return records
}

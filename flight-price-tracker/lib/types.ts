export interface Flight {
  airline: string
  flightNo: string
  departure: string
  arrival: string
  departTime: string
  arriveTime: string
  duration: string
  price: number
  discount: string
  source: string
  departAirport: string
  arriveAirport: string
  stops: number
  date: string
}

export interface SearchParams {
  from: string
  to: string
  date: string
}

export interface CityOption {
  code: string
  name: string
  airports: string[]
}

export interface PriceRecord {
  date: string
  minPrice: number
  avgPrice: number
}

export interface FlightPass {
  airline: string
  name: string
  price: string
  validity: string
  status: 'available' | 'sold_out' | 'upcoming' | 'unknown'
  source: string
  updatedAt: string
  url?: string
  rules?: string
  originalPrice?: string
  coverage?: string
}

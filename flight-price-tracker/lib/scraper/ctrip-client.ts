export interface CtripSearchParams {
  dcity: string
  acity: string
  dcityname: string
  acityname: string
  date: string
}

export class CtripApiError extends Error {
  code: 'TIMEOUT' | 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'NETWORK_ERROR'
  statusCode?: number

  constructor(
    code: CtripApiError['code'],
    message: string,
    statusCode?: number
  ) {
    super(message)
    this.name = 'CtripApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

const CTRIP_FLIGHT_API = 'https://flights.ctrip.com/itinerary/api/12808/products'
const CTRIP_PRICE_API = 'https://flights.ctrip.com/itinerary/api/12808/lowestPrice'
const TIMEOUT_MS = 8000

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
]

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function buildHeaders(referer: string): Record<string, string> {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    'Origin': 'https://flights.ctrip.com',
    'Referer': referer,
    'User-Agent': getRandomUA(),
    'Accept': 'application/json',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new CtripApiError('TIMEOUT', `Request to ${url} timed out after ${TIMEOUT_MS}ms`)
    }
    throw new CtripApiError('NETWORK_ERROR', `Network error: ${(err as Error).message}`)
  } finally {
    clearTimeout(timer)
  }
}

export async function searchFlights(params: CtripSearchParams): Promise<unknown> {
  const referer = `https://flights.ctrip.com/itinerary/oneway/${params.dcity.toLowerCase()}-${params.acity.toLowerCase()}?date=${params.date}`
  const body = {
    flightWay: 'Oneway',
    classType: 'ALL',
    hasChild: false,
    hasBaby: false,
    searchIndex: 1,
    airportParams: [{
      dcity: params.dcity,
      acity: params.acity,
      dcityname: params.dcityname,
      acityname: params.acityname,
      date: params.date,
    }],
  }

  const response = await fetchWithTimeout(CTRIP_FLIGHT_API, {
    method: 'POST',
    headers: buildHeaders(referer),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new CtripApiError('HTTP_ERROR', `HTTP ${response.status}`, response.status)
  }

  const json = await response.json()

  if (!json || typeof json !== 'object' || !('data' in json)) {
    throw new CtripApiError('INVALID_RESPONSE', 'Response missing data field')
  }

  return json
}

export async function fetchLowestPrice(dcity: string, acity: string): Promise<unknown> {
  const url = `${CTRIP_PRICE_API}?flightWay=Oneway&dcity=${dcity}&acity=${acity}&direct=true&army=false`
  const referer = `https://flights.ctrip.com/itinerary/oneway/${dcity.toLowerCase()}-${acity.toLowerCase()}`

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: buildHeaders(referer),
  })

  if (!response.ok) {
    throw new CtripApiError('HTTP_ERROR', `HTTP ${response.status}`, response.status)
  }

  const json = await response.json()

  if (!json || typeof json !== 'object') {
    throw new CtripApiError('INVALID_RESPONSE', 'Invalid lowest price response')
  }

  return json
}

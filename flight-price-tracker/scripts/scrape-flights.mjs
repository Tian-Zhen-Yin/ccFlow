#!/usr/bin/env node

/**
 * Puppeteer-based Ctrip flight scraper
 *
 * Usage:
 *   node scripts/scrape-flights.mjs [from] [to] [date]
 *
 * Examples:
 *   node scripts/scrape-flights.mjs PEK SHA 2026-05-22
 *   node scripts/scrape-flights.mjs PEK SHA       (defaults to tomorrow)
 *   node scripts/scrape-flights.mjs               (defaults to PEK→SHA tomorrow)
 */

import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const SCREENSHOT_DIR = join(DATA_DIR, 'debug')

for (const dir of [DATA_DIR, SCREENSHOT_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const CITY_MAP = {
  PEK: { ctripCode: 'BJS', cityName: '北京' },
  SHA: { ctripCode: 'SHA', cityName: '上海' },
  CAN: { ctripCode: 'CAN', cityName: '广州' },
  CTU: { ctripCode: 'CTU', cityName: '成都' },
  SZX: { ctripCode: 'SZX', cityName: '深圳' },
  HGH: { ctripCode: 'HGH', cityName: '杭州' },
  CKG: { ctripCode: 'CKG', cityName: '重庆' },
  WUH: { ctripCode: 'WUH', cityName: '武汉' },
  XIY: { ctripCode: 'SIA', cityName: '西安' },
  KMG: { ctripCode: 'KMG', cityName: '昆明' },
  NKG: { ctripCode: 'NKG', cityName: '南京' },
  CSX: { ctripCode: 'CSX', cityName: '长沙' },
  TSN: { ctripCode: 'TSN', cityName: '天津' },
  FOC: { ctripCode: 'FOC', cityName: '福州' },
  XMN: { ctripCode: 'XMN', cityName: '厦门' },
  DLC: { ctripCode: 'DLC', cityName: '大连' },
  HRB: { ctripCode: 'HRB', cityName: '哈尔滨' },
  SYX: { ctripCode: 'SYX', cityName: '三亚' },
  KWL: { ctripCode: 'KWL', cityName: '桂林' },
  URC: { ctripCode: 'URC', cityName: '乌鲁木齐' },
}

function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  process.stdout.write(msg + '\n')
  appendFileSync(join(DATA_DIR, 'scraper.log'), line)
}

/**
 * Extract flight data from the Ctrip SPA page DOM.
 */
/**
 * Extract flight data from Ctrip's SPA page DOM.
 * Targets known Ctrip flight-list DOM structure.
 */
async function extractFlights(page, fromIATA, toIATA, date) {
  return page.evaluate(
    ({ fromIATA, toIATA, date }) => {
      const cards = document.querySelectorAll('.flight-item.domestic')
      if (cards.length === 0) {
        return { flights: [], debug: 'No .flight-item.domestic found' }
      }

      const flights = []

      for (const card of cards) {
        const text = card.textContent.trim()
        if (!text) continue

        // --- Flight number ---
        const flightNoEl = card.querySelector('.plane-No')
        const flightNoRaw = flightNoEl?.textContent?.trim() || ''
        const flightNoMatch = flightNoRaw.match(/[A-Z0-9]{2}\d{3,4}/)
        if (!flightNoMatch) continue
        const flightNo = flightNoMatch[0]

        // --- Airline ---
        const airlineEl = card.querySelector('.airline-name')
        let airline = airlineEl?.textContent?.trim() || ''
        // Clean up: remove any trailing whitespace, newlines, etc.
        airline = airline.replace(/\s+/g, ' ').trim()

        // --- Times ---
        const departTimeEl = card.querySelector('.depart-box .time')
        const arriveTimeEl = card.querySelector('.arrive-box .time')
        const departTime = departTimeEl?.textContent?.trim()?.slice(0, 5) || ''
        const arriveTime = arriveTimeEl?.textContent?.trim()?.slice(0, 5) || ''
        if (!departTime || !arriveTime) continue

        // --- Airports ---
        const departAirportEl = card.querySelector('.depart-box .airport .name')
        const departTerminalEl = card.querySelector('.depart-box .airport .terminal')
        const arriveAirportEl = card.querySelector('.arrive-box .airport .name')
        const arriveTerminalEl = card.querySelector('.arrive-box .airport .terminal')

        const departAirport = [
          departAirportEl?.textContent?.trim() || '',
          departTerminalEl?.textContent?.trim() || '',
        ].filter(Boolean).join(' ')

        const arriveAirport = [
          arriveAirportEl?.textContent?.trim() || '',
          arriveTerminalEl?.textContent?.trim() || '',
        ].filter(Boolean).join(' ')

        // --- Price ---
        const priceEl = card.querySelector('.flight-price .price')
        const priceText = priceEl?.textContent?.trim() || ''
        const priceMatch = priceText.match(/(\d{3,5})/)
        const price = priceMatch ? parseInt(priceMatch[1]) : 0
        if (!price) continue

        // --- Discount ---
        const subPriceEl = card.querySelector('.sub-price-item')
        const subPriceText = subPriceEl?.textContent?.trim() || ''
        let discount = ''
        const discMatch = subPriceText.match(/([\d.]+)\s*折/)
        if (discMatch) discount = discMatch[1]

        // --- Duration (compute from times) ---
        const [depH, depM] = departTime.split(':').map(Number)
        const [arrH, arrM] = arriveTime.split(':').map(Number)
        let depMin = depH * 60 + depM
        let arrMin = arrH * 60 + arrM
        if (arrMin < depMin) arrMin += 24 * 60 // cross-midnight
        const diffMin = arrMin - depMin
        const duration = diffMin > 0
          ? `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
          : ''

        // --- Stops ---
        const directTag = card.querySelector('.arrow-oneway')
        const stopText = card.querySelector('#transfer-text-' + flightNo)?.textContent?.trim() || ''
        const directMatch = /直飞/.test(directTag?.className || '') || text.includes('直飞')
        const transferMatch = stopText.match(/(\d+)\s*次?(?:经停|中转)/)
        const stops = directMatch ? 0 : (transferMatch ? parseInt(transferMatch[1]) : 0)

        flights.push({
          airline,
          flightNo,
          departure: fromIATA,
          arrival: toIATA,
          departTime,
          arriveTime,
          duration,
          price,
          discount,
          source: '携程',
          departAirport,
          arriveAirport,
          stops,
          date,
        })
      }

      return {
        flights: flights.sort((a, b) => a.price - b.price),
        debug: `Found ${flights.length} flights from ${cards.length} cards`,
      }
    },
    { fromIATA, toIATA, date }
  )
}

async function scrape(fromIATA, toIATA, date) {
  const fromCity = CITY_MAP[fromIATA]
  const toCity = CITY_MAP[toIATA]

  if (!fromCity || !toCity) {
    log(`ERROR: Unknown city — ${!fromCity ? fromIATA : toIATA}`)
    process.exit(1)
  }

  const dcity = fromCity.ctripCode.toLowerCase()
  const acity = toCity.ctripCode.toLowerCase()
  const url = `https://flights.ctrip.com/itinerary/oneway/${dcity}-${acity}?date=${date}`

  log(`🔍 ${fromCity.cityName}(${fromIATA}) → ${toCity.cityName}(${toIATA}) on ${date}`)
  log(`   URL: ${url}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    )

    // Collect API responses for debugging
    const apiResponses = []
    page.on('response', r => {
      const u = r.url()
      if (u.includes('.ctrip.com') && u.includes('api')) {
        apiResponses.push({ url: u.slice(0, 150), status: r.status(), ok: r.ok() })
      }
    })

    log('   Loading page...')
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
      log(`   Navigation warning: ${e.message}`)
    })

    // Wait for flight results to render
    let found = false
    const resultSelectors = [
      '[class*="flight-list" i]',
      '[class*="flight-card" i]',
      '[class*="flight_card" i]',
      '[class*="FlightCard" i]',
      '[class*="product-item" i]',
      '[class*="result-list" i]',
      '#searchList',
    ]

    for (const sel of resultSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 5000 })
        log(`   Found selector: ${sel}`)
        found = true
        break
      } catch { /* continue */ }
    }

    // Extra wait for SPA rendering
    if (!found) {
      log('   No specific selector found, waiting for content...')
      await new Promise(r => setTimeout(r, 4000))
    } else {
      await new Promise(r => setTimeout(r, 1500))
    }

    // Screenshot for debugging
    const ssPath = join(SCREENSHOT_DIR, `${fromIATA}-${toIATA}-${date}.png`)
    await page.screenshot({ path: ssPath, fullPage: false })
    log(`   Screenshot: ${ssPath}`)

    // Save HTML for debugging
    const html = await page.content()
    const htmlPath = join(SCREENSHOT_DIR, `${fromIATA}-${toIATA}-${date}.html`)
    writeFileSync(htmlPath, html)
    log(`   HTML saved (${(html.length / 1024).toFixed(0)}KB)`)

    // Extract data
    const { flights, debug } = await extractFlights(page, fromIATA, toIATA, date)
    log(`   Extract: ${debug}`)

    // Log API calls
    for (const r of apiResponses.slice(0, 10)) {
      log(`   API ${r.ok ? 'OK' : 'XX'} ${r.status} ${r.url}`)
    }

    // Build result
    const result = {
      meta: {
        from: fromIATA, to: toIATA, date,
        fromCity: fromCity.cityName, toCity: toCity.cityName,
        scrapedAt: new Date().toISOString(),
        source: 'ctrip-puppeteer', url,
      },
      flights,
    }

    const outPath = join(DATA_DIR, `flights-${fromIATA}-${toIATA}-${date}.json`)
    writeFileSync(outPath, JSON.stringify(result, null, 2))
    log(`✅ Saved ${flights.length} flights → ${outPath}`)

    if (flights.length === 0) {
      log('⚠️  Zero flights extracted. Check screenshot + HTML.')
    }

    return result
  } finally {
    await browser.close()
  }
}

// --- CLI ---
const from = (process.argv[2] || 'PEK').toUpperCase()
const to = (process.argv[3] || 'SHA').toUpperCase()
const date = process.argv[4] || getTomorrow()

scrape(from, to, date).catch(err => {
  log(`❌ FATAL: ${err.stack || err.message}`)
  process.exit(1)
})

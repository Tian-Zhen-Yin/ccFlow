#!/usr/bin/env node

/**
 * Scrape airline 随心飞 / flight pass data from multiple sources.
 *
 * Tries:
 *   1. Ctrip search results page for bundled products
 *   2. Known airline promotion URLs
 *   3. Ctrip homepage for promotion banners
 *
 * Saves to: data/flight-passes.json
 *
 * Usage:
 *   node scripts/scrape-passes.mjs
 */

import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  process.stdout.write(msg + '\n')
  appendFileSync(join(DATA_DIR, 'scraper.log'), line + '\n')
}

/** Known airline 随心飞 promo pages */
const AIRLINE_URLS = [
  { airline: '南方航空', url: 'https://www.csair.com/cn/' },
  { airline: '东方航空', url: 'https://www.ceair.com/' },
  { airline: '中国国航', url: 'https://www.airchina.com.cn/' },
  { airline: '海南航空', url: 'https://www.hnair.com/' },
  { airline: '春秋航空', url: 'https://www.ch.com/' },
  { airline: '吉祥航空', url: 'https://www.juneyaoair.com/' },
  { airline: '四川航空', url: 'https://www.sichuanair.com/' },
  { airline: '厦门航空', url: 'https://www.xiamenair.com/' },
  { airline: '深圳航空', url: 'https://www.shenzhenair.com/' },
]

/**
 * Check a Ctrip search page for product/promotion sections.
 */
async function scrapeCtripPromotions(page) {
  log('Checking Ctrip search page for promotions...')

  const results = []
  const url = 'https://flights.ctrip.com/itinerary/oneway/bjs-sha'

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
    await new Promise(r => setTimeout(r, 3000))

    // Look for promotional product sections in the page
    const promoTexts = await page.evaluate(() => {
      const allText = document.body.innerText
      const lines = allText.split('\n').filter(l => l.trim())
      // Find lines mentioning relevant products
      const keywords = ['随心飞', '次卡', '飞行卡', '畅飞', '产品推荐', '套餐', '特价', '优惠', '活动', '会员日', '促销']
      return lines.filter(l => keywords.some(k => l.includes(k))).slice(0, 20)
    })

    if (promoTexts.length > 0) {
      log(`  Found ${promoTexts.length} promotion-related lines`)
      promoTexts.forEach(t => log(`    ${t.slice(0, 100)}`))
      results.push({ source: 'ctrip-search', texts: promoTexts })
    } else {
      log('  No promotion content found on Ctrip search page')
    }
  } catch (err) {
    log(`  Ctrip search page error: ${err.message}`)
  }

  return results
}

/**
 * Check Ctrip homepage for promotion banners.
 */
async function scrapeCtripHomepage(page) {
  log('Checking Ctrip homepage for promotions...')

  try {
    await page.goto('https://www.ctrip.com/', { waitUntil: 'networkidle2', timeout: 25000 })
    await new Promise(r => setTimeout(r, 3000))

    const banners = await page.evaluate(() => {
      const allText = document.body.innerText
      const lines = allText.split('\n').filter(l => l.trim())
      const keywords = ['随心飞', '次卡', '飞行卡', '畅飞', '机票', '特价', '优惠', '特惠', '活动', '会员日']
      return lines.filter(l => keywords.some(k => l.includes(k))).slice(0, 30)
    })

    if (banners.length > 0) {
      log(`  Found ${banners.length} promotion lines on Ctrip homepage`)
      banners.forEach(t => log(`    ${t.slice(0, 120)}`))
    } else {
      log('  No promotion content found on Ctrip homepage')
    }

    return { source: 'ctrip-homepage', banners }
  } catch (err) {
    log(`  Ctrip homepage error: ${err.message}`)
    return { source: 'ctrip-homepage', banners: [] }
  }
}

async function main() {
  log('Starting flight pass scraper...')
  log(`Sources: ${AIRLINE_URLS.length} airlines + 2 Ctrip pages`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const scrapedData = {
    meta: {
      scrapedAt: new Date().toISOString(),
      source: 'puppeteer-multi',
    },
    sources: [],
  }

  try {
    // Check Ctrip sources
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    )

    const ctripSearch = await scrapeCtripPromotions(page)
    scrapedData.sources.push(ctripSearch)

    const ctripHome = await scrapeCtripHomepage(page)
    scrapedData.sources.push(ctripHome)

    // Quick check airline homepages
    log('Checking airline homepages...')
    for (const { airline, url } of AIRLINE_URLS) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await new Promise(r => setTimeout(r, 2000))

        const found = await page.evaluate(() => {
          const text = document.body.innerText
          const kws = ['随心飞', '次卡', '飞行卡', '畅飞', '无限飞', '想飞就飞', '安逸飞', '深情飞', '畅享飞']
          return kws.filter(k => text.includes(k))
        })

        log(`  ${airline}: ${found.length > 0 ? 'FOUND: ' + found.join(', ') : 'no pass keywords found'}`)
        scrapedData.sources.push({ airline, url, found })
      } catch (err) {
        log(`  ${airline}: error - ${err.message.slice(0, 80)}`)
        scrapedData.sources.push({ airline, url, error: err.message.slice(0, 100) })
      }
    }

    await page.close()
  } finally {
    await browser.close()
  }

  // Save raw scraped data
  const outPath = join(DATA_DIR, 'flight-passes-raw.json')
  writeFileSync(outPath, JSON.stringify(scrapedData, null, 2))
  log(`\nRaw scraped data saved → ${outPath}`)

  // Report summary
  const withPass = scrapedData.sources.filter(s => s.found?.length > 0 || s.texts?.length > 0)
  log(`\nSources with pass mentions: ${withPass.length} / ${scrapedData.sources.length}`)
  log('Done.')
}

main().catch(err => {
  log(`FATAL: ${err.message}`)
  process.exit(1)
})

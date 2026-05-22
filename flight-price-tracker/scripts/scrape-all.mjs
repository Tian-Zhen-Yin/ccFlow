#!/usr/bin/env node

/**
 * Batch scrape all major routes from Ctrip.
 *
 * Usage:
 *   node scripts/scrape-all.mjs                  # scrape all routes for tomorrow
 *   node scripts/scrape-all.mjs 2026-05-30       # scrape all routes for a specific date
 *   node scripts/scrape-all.mjs 2026-05-30 3     # scrape for date, max 3 concurrent
 */

import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROUTES = [
  // 一线城市互飞
  ['PEK', 'SHA'], ['SHA', 'PEK'],
  ['PEK', 'CAN'], ['CAN', 'PEK'],
  ['PEK', 'SZX'], ['SZX', 'PEK'],
  ['SHA', 'CAN'], ['CAN', 'SHA'],
  ['SHA', 'SZX'], ['SZX', 'SHA'],
  // 成都/杭州/重庆/武汉/西安
  ['SHA', 'CTU'], ['CTU', 'SHA'],
  ['PEK', 'CTU'], ['CTU', 'PEK'],
  ['SHA', 'HGH'], ['HGH', 'SHA'],
  ['PEK', 'HGH'], ['HGH', 'PEK'],
  ['SHA', 'CKG'], ['CKG', 'SHA'],
  ['PEK', 'CKG'], ['CKG', 'PEK'],
  ['SHA', 'WUH'], ['WUH', 'SHA'],
  ['PEK', 'WUH'], ['WUH', 'PEK'],
  ['SHA', 'XIY'], ['XIY', 'SHA'],
  // 昆明/三亚/青岛/海口/厦门
  ['PEK', 'KMG'], ['KMG', 'PEK'],
  ['SHA', 'KMG'], ['KMG', 'SHA'],
  ['PEK', 'SYX'], ['SYX', 'PEK'],
  ['SHA', 'SYX'], ['SYX', 'SHA'],
  ['PEK', 'TAO'], ['TAO', 'PEK'],
  ['SHA', 'TAO'], ['TAO', 'SHA'],
  ['PEK', 'HAK'], ['HAK', 'PEK'],
  ['SHA', 'HAK'], ['HAK', 'SHA'],
  ['PEK', 'XMN'], ['XMN', 'PEK'],
  ['SHA', 'XMN'], ['XMN', 'SHA'],
  // 南京/长沙/天津
  ['PEK', 'NKG'], ['NKG', 'PEK'],
  ['SHA', 'NKG'], ['NKG', 'SHA'],
  ['PEK', 'CSX'], ['CSX', 'PEK'],
  ['PEK', 'TSN'], ['TSN', 'PEK'],
  ['SHA', 'TSN'], ['TSN', 'SHA'],
]

const date = process.argv[2] || (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

const maxConcurrent = parseInt(process.argv[3] || '4', 10)

async function main() {
  console.log(`Batch scraping ${ROUTES.length} routes for ${date} (max ${maxConcurrent} concurrent)\n`)

  const results = []
  const queue = [...ROUTES]

  async function worker() {
    while (queue.length > 0) {
      const [from, to] = queue.shift()
      try {
        const label = `${from}→${to}`
        process.stdout.write(`[${label}] Starting...\n`)
        const out = execSync(
          `node ${join(__dirname, 'scrape-flights.mjs')} ${from} ${to} ${date}`,
          { timeout: 60000, encoding: 'utf-8' }
        )
        const match = out.match(/✅ Saved (\d+) flights/)
        const count = match ? parseInt(match[1]) : 0
        results.push({ from, to, count, status: 'ok' })
        process.stdout.write(`[${label}] ✅ ${count} flights\n`)
      } catch (err) {
        results.push({ from, to, count: 0, status: 'error', error: err.message })
        process.stdout.write(`[${from}→${to}] ❌ ${err.message}\n`)
      }
    }
  }

  const workers = Array.from({ length: maxConcurrent }, () => worker())
  await Promise.all(workers)

  // Summary
  const ok = results.filter(r => r.status === 'ok')
  const fail = results.filter(r => r.status === 'error')
  const totalFlights = ok.reduce((s, r) => s + r.count, 0)

  console.log(`\n═══════════════════════════════`)
  console.log(`  Total: ${results.length} routes`)
  console.log(`  OK: ${ok.length} (${totalFlights} flights)`)
  if (fail.length > 0) {
    console.log(`  Failed: ${fail.length}`)
    for (const r of fail) {
      console.log(`    ${r.from}→${r.to}: ${r.error}`)
    }
  }
  console.log(`═══════════════════════════════`)
}

main().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})

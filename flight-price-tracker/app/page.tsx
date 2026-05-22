'use client'

import { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import FlightCard from '@/components/FlightCard'
import PriceChart from '@/components/PriceChart'
import FlightPassCard from '@/components/FlightPassCard'
import type { Flight, SearchParams, PriceRecord, FlightPass } from '@/lib/types'

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchInfo, setSearchInfo] = useState<SearchParams | null>(null)
  const [passes, setPasses] = useState<FlightPass[]>([])

  useEffect(() => {
    fetch('/api/passes')
      .then(r => r.json())
      .then(d => setPasses(d.passes))
      .catch(() => {})
  }, [])

  async function handleSearch(params: SearchParams) {
    setLoading(true)
    setSearchInfo(params)
    try {
      const res = await fetch(`/api/flights?from=${params.from}&to=${params.to}&date=${params.date}`)
      const data = await res.json()
      setFlights(data.flights)
      setPriceHistory(data.priceHistory)
      setSearched(true)
    } catch {
      setFlights([])
      setPriceHistory([])
    } finally {
      setLoading(false)
    }
  }

  const minPrice = flights.length > 0 ? flights[0].price : 0
  const maxPrice = flights.length > 0 ? flights[flights.length - 1].price : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          国内机票比价
        </h1>
        <p className="text-text-secondary">
          同时对比携程、去哪儿、飞猪、同程等平台，找到最低价航班
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {searched && (
        <div className="mt-8 space-y-6 animate-fade-in-up">
          {flights.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-surface border border-border rounded-xl p-4">
                <div className="text-text-muted text-sm mb-1">最低价</div>
                <div className="text-2xl font-bold text-primary">¥{minPrice}</div>
              </div>
              <div className="flex-1 bg-surface border border-border rounded-xl p-4">
                <div className="text-text-muted text-sm mb-1">最高价</div>
                <div className="text-2xl font-bold text-text-primary">¥{maxPrice}</div>
              </div>
              <div className="flex-1 bg-surface border border-border rounded-xl p-4">
                <div className="text-text-muted text-sm mb-1">共找到</div>
                <div className="text-2xl font-bold text-accent">{flights.length} 个航班</div>
              </div>
              <div className="flex-1 bg-surface border border-border rounded-xl p-4">
                <div className="text-text-muted text-sm mb-1">价差</div>
                <div className="text-2xl font-bold text-yellow-400">¥{maxPrice - minPrice}</div>
              </div>
            </div>
          )}

          <PriceChart data={priceHistory} />

          {flights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                航班列表
                <span className="text-text-muted text-sm font-normal ml-2">
                  {searchInfo?.from} → {searchInfo?.to} · {searchInfo?.date}
                </span>
              </h2>
              <div className="space-y-3">
                {flights.map((flight, i) => (
                  <div key={flight.flightNo + flight.source} className={`animate-fade-in-up stagger-${Math.min(i, 3)}`}>
                    <FlightCard flight={flight} rank={i} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {flights.length === 0 && !loading && (
            <div className="text-center py-12 text-text-muted">
              <p className="text-lg">未找到符合条件的航班</p>
              <p className="text-sm mt-2">请尝试更换日期或航线</p>
            </div>
          )}
        </div>
      )}

      {/* 随心飞套餐 section — always visible */}
      {passes.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">航司随心飞套餐</h2>
              <p className="text-sm text-text-muted mt-1">各大航空公司飞行套餐汇总，价格仅供参考</p>
            </div>
            <span className="text-xs text-text-muted bg-surface border border-border px-3 py-1.5 rounded-full">
              {passes.length} 个套餐
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {passes.map(pass => (
              <FlightPassCard key={pass.airline + pass.name} pass={pass} />
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div className="mt-16 text-center text-text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-40">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>选择出发地、目的地和日期，开始搜索航班</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { cities } from '@/lib/cities'
import DatePicker from './DatePicker'
import type { SearchParams } from '@/lib/types'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  loading: boolean
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [from, setFrom] = useState('PEK')
  const [to, setTo] = useState('SHA')
  const [date, setDate] = useState(today)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (from === to) return
    onSearch({ from, to, date })
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-text-muted mb-2">出发城市</label>
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary focus:outline-none transition-colors"
            >
              {cities.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="self-end mb-3 p-2 text-text-muted hover:text-primary transition-colors md:mb-3"
            aria-label="交换出发和到达城市"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>

          <div className="flex-1 w-full">
            <label className="block text-sm text-text-muted mb-2">到达城市</label>
            <select
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary focus:outline-none transition-colors"
            >
              {cities.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm text-text-muted mb-2">出发日期</label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          <button
            type="submit"
            disabled={loading || from === to}
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? '搜索中...' : '搜索航班'}
          </button>
        </div>

        {from === to && (
          <p className="text-sm text-yellow-400 mt-3">出发城市和到达城市不能相同</p>
        )}
      </div>
    </form>
  )
}

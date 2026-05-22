'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine,
} from 'recharts'
import type { PriceRecord } from '@/lib/types'

interface PriceChartProps {
  data: PriceRecord[]
}

export default function PriceChart({ data }: PriceChartProps) {
  const today = new Date().toISOString().slice(0, 10)

  const { chartData, hasFuture } = useMemo(() => {
    if (data.length === 0) return { chartData: [], hasFuture: false }

    // Find the index where future dates start
    const futureIdx = data.findIndex(p => p.date >= today)
    const hasF = futureIdx > 0 && futureIdx < data.length - 1

    const enriched = data.map(p => ({
      ...p,
      // Gray out future projected prices visually by marking them
      isFuture: p.date >= today,
      // Give each point a display label
      label: p.date.slice(5),
    }))

    return { chartData: enriched, hasFuture: hasF }
  }, [data, today])

  if (chartData.length === 0) return null

  const futureLabel = hasFuture ? ' · 未来预测' : ''

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        价格趋势{futureLabel}
      </h2>
      <p className="text-xs text-text-muted mb-4">实线为实际价格，虚线为未来预订价格 · 含 {chartData.length} 天数据</p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />

            <XAxis
              dataKey="label"
              tick={{ fill: '#6b6b80', fontSize: 10 }}
              interval={Math.max(Math.floor(chartData.length / 10), 1)}
              axisLine={{ stroke: 'rgba(139,92,246,0.15)' }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#6b6b80', fontSize: 11 }}
              tickFormatter={(v: number) => `¥${v}`}
              width={56}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '13px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
              formatter={(value) => [
                `¥${value}`,
                '最低价',
              ]}
              labelFormatter={(label) => `日期: ${label}`}
            />

            {/* Today reference line */}
            {hasFuture && (
              <ReferenceLine
                x={today.slice(5)}
                stroke="rgba(6, 182, 212, 0.5)"
                strokeDasharray="4 4"
                label={{
                  value: '今天',
                  position: 'top',
                  fill: '#06b6d4',
                  fontSize: 11,
                }}
              />
            )}

            {/* Historical data (solid line) */}
            <Line
              type="monotone"
              dataKey="minPrice"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#0a0a1a', strokeWidth: 2 }}
              name="最低价"
            />

            {/* Future data (dashed line) — filtered to only draw dots on future points */}
            {hasFuture && (
              <Line
                type="monotone"
                dataKey="minPrice"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={false}
                connectNulls={false}
                name="未来价格"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

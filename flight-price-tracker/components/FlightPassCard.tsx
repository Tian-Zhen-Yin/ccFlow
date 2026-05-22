'use client'

import type { FlightPass } from '@/lib/types'

interface FlightPassCardProps {
  pass: FlightPass
}

const STATUS_LABEL: Record<string, string> = {
  available: '在售',
  sold_out: '已售罄',
  upcoming: '即将开售',
  unknown: '未知',
}

const STATUS_STYLE: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sold_out: 'bg-red-500/20 text-red-400 border-red-500/30',
  upcoming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function FlightPassCard({ pass }: FlightPassCardProps) {
  const statusLabel = STATUS_LABEL[pass.status] || STATUS_LABEL.unknown
  const statusStyle = STATUS_STYLE[pass.status] || STATUS_STYLE.unknown

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group">
      {/* Header: airline + status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text-secondary">{pass.airline}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">{pass.name}</h3>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-primary">{pass.price}</span>
        {pass.originalPrice && (
          <span className="text-sm text-text-muted line-through">{pass.originalPrice}</span>
        )}
      </div>

      {/* Info grid */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-text-secondary">{pass.validity}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span className="text-text-secondary">{pass.coverage || pass.source}</span>
        </div>
      </div>

      {/* Rules */}
      {pass.rules && (
        <p className="text-xs text-text-muted leading-relaxed border-t border-border pt-3">
          {pass.rules}
        </p>
      )}
    </div>
  )
}

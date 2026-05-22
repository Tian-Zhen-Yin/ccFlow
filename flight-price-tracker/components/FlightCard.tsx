import type { Flight } from '@/lib/types'

interface FlightCardProps {
  flight: Flight
  rank: number
}

export default function FlightCard({ flight, rank }: FlightCardProps) {
  const isCheapest = rank === 0

  return (
    <div
      className={`relative bg-surface border rounded-xl p-5 transition-all hover:border-primary/50 ${
        isCheapest ? 'border-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'border-border'
      }`}
    >
      {isCheapest && (
        <span className="absolute -top-2.5 left-4 bg-primary text-white text-xs px-3 py-0.5 rounded-full font-medium">
          最低价
        </span>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {flight.flightNo.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium truncate">{flight.airline}</span>
              <span className="text-text-muted text-sm">{flight.flightNo}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
              <span>{flight.source}</span>
              {flight.stops > 0 && <span className="text-yellow-400">经停{flight.stops}次</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-text-primary text-lg font-mono font-semibold">{flight.departTime}</div>
            <div className="text-text-muted text-xs">{flight.departAirport}</div>
          </div>

          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="text-text-muted text-xs">{flight.duration}</div>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-border" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary flex-shrink-0">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="text-center">
            <div className="text-text-primary text-lg font-mono font-semibold">{flight.arriveTime}</div>
            <div className="text-text-muted text-xs">{flight.arriveAirport}</div>
          </div>
        </div>

        <div className="flex flex-col items-end md:min-w-[120px]">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">¥{flight.price}</span>
          </div>
          {flight.discount && (
            <span className="text-xs text-green-400 mt-1">
              {flight.discount}折
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

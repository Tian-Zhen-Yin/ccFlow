'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface DatePickerProps {
  value: string  // YYYY-MM-DD
  onChange: (date: string) => void
  minDate?: string
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function toDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DatePicker({ value, onChange, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = useMemo(() => toDate(value), [value])
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  // Sync view when value changes externally
  useEffect(() => {
    setViewYear(selected.getFullYear())
    setViewMonth(selected.getMonth())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function nav(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function goToday() {
    const today = new Date()
    onChange(formatDate(today))
    setOpen(false)
  }

  function selectDate(date: string) {
    onChange(date)
    setOpen(false)
  }

  // Build calendar grid
  const calendar = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: Array<{ day: number; date: string; isCurrentMonth: boolean }> = []

    // Previous month fill
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, prevMonthDays - i)
      cells.push({ day: prevMonthDays - i, date: formatDate(d), isCurrentMonth: false })
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i)
      cells.push({ day: i, date: formatDate(d), isCurrentMonth: true })
    }

    // Complete last row
    const remainder = cells.length % 7
    if (remainder > 0) {
      for (let i = 1; i <= 7 - remainder; i++) {
        const d = new Date(viewYear, viewMonth + 1, i)
        cells.push({ day: i, date: formatDate(d), isCurrentMonth: false })
      }
    }

    return cells
  }, [viewYear, viewMonth])

  const todayStr = formatDate(new Date())
  const displayDate = selected.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
      >
        <span className="text-sm">{displayDate}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
        </svg>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-surface border border-border rounded-xl p-4 w-[280px] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-primary/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                {viewYear}年{MONTHS[viewMonth]}
              </span>
              <button
                type="button"
                onClick={goToday}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                今天
              </button>
            </div>

            <button
              type="button"
              onClick={() => nav(1)}
              className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-primary/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-center text-xs text-text-muted/60 py-1 font-medium">{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendar.map((cell, i) => {
              const isSelected = cell.date === value
              const isToday = cell.date === todayStr
              const isPast = minDate ? cell.date < minDate : false

              let cls = 'text-center py-1.5 text-sm rounded-lg relative transition-colors '

              if (isSelected) {
                cls += 'bg-primary text-white font-semibold '
              } else if (isToday) {
                cls += 'text-accent font-semibold '
              } else if (!cell.isCurrentMonth) {
                cls += 'text-text-muted/20 '
              } else if (isPast) {
                cls += 'text-text-muted/40 '
              } else {
                cls += 'text-text-secondary hover:bg-primary/10 hover:text-text-primary cursor-pointer '
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!cell.isCurrentMonth || isPast}
                  className={cls}
                  onClick={() => selectDate(cell.date)}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

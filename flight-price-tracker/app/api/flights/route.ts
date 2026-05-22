import { NextRequest, NextResponse } from 'next/server'
import { getFlights } from '@/lib/scraper'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  if (!from || !to || !date) {
    return NextResponse.json(
      { error: 'Missing required params: from, to, date' },
      { status: 400 }
    )
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format, use YYYY-MM-DD' },
      { status: 400 }
    )
  }

  const { flights, priceHistory } = await getFlights(from, to, date)

  return NextResponse.json({ flights, priceHistory })
}

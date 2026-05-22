import { NextResponse } from 'next/server'
import { getFlightPasses } from '@/lib/passes'

export async function GET() {
  const passes = await getFlightPasses()
  return NextResponse.json({ passes })
}

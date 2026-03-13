import { NextRequest, NextResponse } from 'next/server'
import { importFromSheet } from '@/lib/import-sheet'

export async function POST(req: NextRequest) {
  // Optional cron secret protection
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await importFromSheet('api')
    return NextResponse.json({ success: true, ...result })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  const { prisma } = await import('@/lib/db')
  const logs = await prisma.syncLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
  return NextResponse.json({ data: logs })
}

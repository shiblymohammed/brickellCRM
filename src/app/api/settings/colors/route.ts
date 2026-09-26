import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { LeadStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { status, theme } = await req.json()
    if (!status || !theme) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await prisma.statusColor.upsert({
      where: { status: status as LeadStatus },
      update: { theme },
      create: { status: status as LeadStatus, theme }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update status color error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

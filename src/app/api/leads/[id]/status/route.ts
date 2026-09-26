import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['CONTACTED','INTERESTED','FOLLOW_UP','QUOTATION','NEGOTIATION','WON','LOST']),
  updatedById: z.string(),
  note: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, updatedById, note } = statusSchema.parse(body)

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    })

    await prisma.leadStatusHistory.create({
      data: { leadId: id, status, changedById: updatedById }
    })

    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: 'STATUS_CHANGED',
        description: `Status updated to ${status.replace(/_/g, ' ')}${note ? ` — ${note}` : ''}`,
        createdById: updatedById,
      }
    })

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

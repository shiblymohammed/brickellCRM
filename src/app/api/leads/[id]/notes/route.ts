import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const noteSchema = z.object({
  note: z.string().min(1).max(2000),
  authorId: z.string(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notes = await prisma.leadNote.findMany({
    where: { leadId: id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'asc' },
  })
  return NextResponse.json({ notes })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { note, authorId } = noteSchema.parse(body)

    const created = await prisma.leadNote.create({
      data: { leadId: id, note, authorId },
      include: { author: { select: { id: true, name: true } } },
    })

    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: 'NOTE_ADDED',
        description: `Note added: "${note.substring(0, 80)}${note.length > 80 ? '…' : ''}"`,
        createdById: authorId,
      }
    })

    return NextResponse.json({ success: true, note: created })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

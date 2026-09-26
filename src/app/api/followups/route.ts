import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const createFollowUpSchema = z.object({
  leadId: z.string(),
  assignedStaffId: z.string(),
  date: z.string(),
  time: z.string(),
  reason: z.string().min(1),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get('staffId')
    const status = searchParams.get('status')

    const followups = await prisma.followUp.findMany({
      where: {
        ...(staffId ? { assignedStaffId: staffId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        lead: {
          select: {
            id: true,
            customerName: true,
            phone: true,
            requirement: true,
            leadTemperature: true,
          }
        },
        assignedStaff: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ followups })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createFollowUpSchema.parse(body)

    const followup = await prisma.followUp.create({
      data: {
        leadId: parsed.leadId,
        assignedStaffId: parsed.assignedStaffId,
        date: new Date(parsed.date),
        time: parsed.time,
        reason: parsed.reason,
        status: 'PENDING',
      },
      include: {
        lead: { select: { customerName: true } },
        assignedStaff: { select: { name: true } }
      }
    })

    // Log activity on lead
    await prisma.leadActivity.create({
      data: {
        leadId: parsed.leadId,
        type: 'FOLLOWUP_SCHEDULED',
        description: `Follow-up scheduled for ${new Date(parsed.date).toLocaleDateString()} at ${parsed.time} — ${parsed.reason}`,
        createdById: parsed.assignedStaffId,
      }
    })

    return NextResponse.json({ success: true, followup })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

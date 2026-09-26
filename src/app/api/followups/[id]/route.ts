import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await req.json()

    const followup = await prisma.followUp.update({
      where: { id },
      data: { status },
      include: {
        lead: { select: { id: true, customerName: true } }
      }
    })

    // Log activity on lead
    await prisma.leadActivity.create({
      data: {
        leadId: followup.leadId,
        type: 'FOLLOWUP_UPDATED',
        description: `Follow-up marked as ${status}`,
        createdById: followup.assignedStaffId,
      }
    })

    return NextResponse.json({ success: true, followup })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

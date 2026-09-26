import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { assignLead } from '@/lib/assignments/engine';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { action, ...leadData } = data;

    if (action === 'REJECT') {
      await prisma.lead.update({
        where: { id },
        data: { status: 'REJECTED' }
      });

      await prisma.leadStatusHistory.create({
        data: { leadId: id, status: 'REJECTED' }
      });

      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'LEAD_REJECTED',
          description: 'Lead rejected by admin during audit'
        }
      });

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    if (action === 'APPROVE') {
      // Update lead with edited fields and APPROVED status first
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          customerName: leadData.customerName ?? undefined,
          phone: leadData.phone ?? undefined,
          alternatePhone: leadData.alternatePhone ?? undefined,
          location: leadData.location ?? undefined,
          requirement: leadData.requirement ?? undefined,
          category: leadData.category ?? undefined,
          budget: leadData.budget ?? undefined,
          timeline: leadData.timeline ?? undefined,
          urgency: leadData.urgency ?? undefined,
          intent: leadData.intent ?? undefined,
          leadTemperature: leadData.leadTemperature ?? undefined,
          summary: leadData.summary ?? undefined,
          status: 'APPROVED',
        }
      });

      // Log APPROVED status
      await prisma.leadStatusHistory.create({
        data: { leadId: id, status: 'APPROVED' }
      });

      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'LEAD_APPROVED',
          description: 'Lead approved by admin and entered the pipeline'
        }
      });

      // Trigger automatic assignment engine
      const assignment = await assignLead(
        id,
        'ROUND_ROBIN',
        updatedLead.category
      );

      return NextResponse.json({
        success: true,
        status: assignment ? 'ASSIGNED' : 'APPROVED',
        assignedTo: assignment?.employeeName ?? null,
        strategy: assignment?.strategy ?? null,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Audit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

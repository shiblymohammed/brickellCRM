import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const { contacts, hash } = await req.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const createdLeads = await Promise.all(
      contacts.map(async (contact: any, index: number) => {
        const lead = await prisma.lead.create({
          data: {
            customerName: contact.name || null,
            phone: contact.phone || null,
            status: 'PENDING_AUDIT', // Or AI_DRAFT, but user audited them in UI
            aiConfidence: contact.name ? 90 : 70,
          }
        });

        // Attach screenshot if hash provided
        if (hash) {
          const uniqueHash = `${hash}-${Date.now()}-${index}`;
          await prisma.leadScreenshot.create({
            data: {
              leadId: lead.id,
              hash: uniqueHash,
              storageUrl: `mock-storage-url-${hash}.jpg`
            }
          });
        }

        return lead;
      })
    );

    return NextResponse.json({ success: true, count: createdLeads.length });
  } catch (error: any) {
    console.error('Bulk Create Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

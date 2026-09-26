import { NextResponse } from 'next/server';
import { extractContactsFromGroupScreenshot } from '@/lib/ai/gemini';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const base64Images: string[] = [];
    const hashes: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const base64 = buffer.toString('base64');
      base64Images.push(base64);
      hashes.push(hash);
    }

    // Extract list of contacts from the group member screenshot(s)
    const { contacts, totalFound } = await extractContactsFromGroupScreenshot(base64Images);

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        error: 'No contacts found in the screenshot. Make sure it is a WhatsApp group members list.'
      }, { status: 422 });
    }

    // Check each contact for duplicates against existing leads
    const allLeads = await prisma.lead.findMany({
      select: { phone: true, customerName: true },
      where: { status: { notIn: ['REJECTED'] } }
    });

    const normalizePhone = (p: string) => p.replace(/\D/g, '').replace(/^0+/, '').slice(-10);

    const contactsWithDuplicates = contacts.map(c => {
      let isDuplicate = false;
      if (c.phone) {
        const normPhone = normalizePhone(c.phone);
        isDuplicate = allLeads.some(l => l.phone && normalizePhone(l.phone) === normPhone);
      }
      return { ...c, isDuplicate, selected: !isDuplicate };
    });

    return NextResponse.json({
      success: true,
      totalExtracted: contacts.length,
      totalFound,
      contacts: contactsWithDuplicates, 
      hashes, 
    });

  } catch (error: any) {
    console.error('Upload Error:', error?.message || error);

    let message = 'Internal Server Error';
    if (error?.message?.includes('API_KEY') || error?.message?.includes('API key')) {
      message = 'Gemini API key is missing or invalid. Check GEMINI_API_KEY in .env';
    } else if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes("Can't reach")) {
      message = 'Database connection failed. Check DATABASE_URL in .env';
    } else if (error?.message) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

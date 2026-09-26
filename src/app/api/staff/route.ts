import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const { name, email, phone, role, department, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // 2. Create Employee record in Prisma
    const employee = await prisma.employee.create({
      data: {
        userId: authData.user.id,
        email,
        name,
        phone,
        role: role || 'SALES_STAFF',
        department,
        active: true
      }
    });

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error('Create Staff Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'

async function createActionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createActionClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Login failed. Please try again.' }
  }

  // Fetch the employee record to determine role
  const employee = await prisma.employee.findUnique({
    where: { userId: data.user.id }
  })

  if (!employee) {
    await supabase.auth.signOut()
    return { error: 'No staff account found for this user. Contact your administrator.' }
  }

  if (!employee.active) {
    await supabase.auth.signOut()
    return { error: 'Your account has been deactivated. Contact your administrator.' }
  }

  // Redirect based on role
  if (employee.role === 'SALES_STAFF') {
    redirect('/sales')
  } else {
    redirect('/admin')
  }
}

export async function logout() {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect('/login')
}

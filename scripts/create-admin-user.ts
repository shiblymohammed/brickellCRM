/**
 * Run this script once to create the first admin user in Supabase Auth
 * and link them to the seeded admin Employee record.
 *
 * Usage:
 *   npx tsx scripts/create-admin-user.ts
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/db/prisma'

const ADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@fellow.ai'
const ADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Admin@123456' // Change this after first login!

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey || serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set or is the same as the anon key.')
    console.error('   Please set the service role key in .env before running this script.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log(`Creating Supabase Auth user: ${ADMIN_EMAIL}...`)

  // Check if auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const exists = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)

  let userId: string

  if (exists) {
    console.log(`⚠  Auth user already exists (id: ${exists.id}). Using existing.`)
    userId = exists.id
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })

    if (error || !data.user) {
      console.error('❌ Failed to create auth user:', error?.message)
      process.exit(1)
    }

    userId = data.user.id
    console.log(`✅ Auth user created (id: ${userId})`)
  }

  // Link to Employee record
  const employee = await prisma.employee.findFirst({
    where: { email: ADMIN_EMAIL }
  })

  if (!employee) {
    console.error(`❌ No Employee record found with email: ${ADMIN_EMAIL}`)
    console.error('   Make sure you have run: npx tsx prisma/seed.ts')
    process.exit(1)
  }

  await prisma.employee.update({
    where: { id: employee.id },
    data: { userId }
  })

  console.log(`✅ Linked Supabase user to Employee: ${employee.name} (${employee.role})`)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Login credentials:')
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log('  ⚠  Please change your password after first login!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

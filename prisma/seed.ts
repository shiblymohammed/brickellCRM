import 'dotenv/config'
import { Role, LeadStatus, AttendanceStatus } from '@prisma/client'
import { prisma } from '../src/lib/db/prisma'

async function main() {
  console.log('Starting seed...')

  // Clean up existing data
  await prisma.leadActivity.deleteMany()
  await prisma.leadStatusHistory.deleteMany()
  await prisma.leadNote.deleteMany()
  await prisma.leadScreenshot.deleteMany()
  await prisma.followUp.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.employee.deleteMany()

  // Create Sales Staff
  const staffNames = ['Afsal Rahman', 'Rahul Sharma', 'Priya Patel', 'Mohammed Tariq', 'Anita Singh']
  const employees: Awaited<ReturnType<typeof prisma.employee.create>>[] = []

  for (const name of staffNames) {
    const employee = await prisma.employee.create({
      data: {
        userId: `mock-auth-id-${name.replace(/\s+/g, '-').toLowerCase()}`, // Mock Supabase Auth ID
        email: `${name.replace(/\s+/g, '').toLowerCase()}@brickell.com`,
        name,
        phone: `+91987654321${employees.length}`,
        role: Role.SALES_STAFF,
        department: 'Sales',
        active: true,
      }
    })
    employees.push(employee)
  }

  // Create an Admin
  const admin = await prisma.employee.create({
    data: {
      userId: `mock-auth-id-admin`,
      email: `admin@brickell.com`,
      name: `Super Admin`,
      role: Role.ADMIN,
      department: 'Management',
    }
  })

  // Create Leads
  console.log('Creating mock leads...')
  const requirements = ['E-commerce Website', 'ERP System', 'Digital Marketing', 'Mobile App', 'SEO Optimization']
  const locations = ['Kozhikode', 'Kochi', 'Bengaluru', 'Mumbai', 'Dubai']
  
  for (let i = 0; i < 30; i++) {
    const assignedStaff = i % 3 !== 0 ? employees[i % employees.length] : null // leave some unassigned
    const status: LeadStatus = assignedStaff 
      ? (i % 2 === 0 ? LeadStatus.ASSIGNED : (i % 3 === 0 ? LeadStatus.CONTACTED : LeadStatus.INTERESTED))
      : (i % 2 === 0 ? LeadStatus.AI_DRAFT : LeadStatus.PENDING_AUDIT)

    const lead = await prisma.lead.create({
      data: {
        customerName: `Customer ${i + 1}`,
        phone: `+9190000000${i < 10 ? '0'+i : i}`,
        location: locations[i % locations.length],
        requirement: requirements[i % requirements.length],
        budget: i % 2 === 0 ? '₹50,000–₹75,000' : '₹1,00,000+',
        leadTemperature: i % 4 === 0 ? 'hot' : 'warm',
        status,
        aiConfidence: Math.floor(Math.random() * 20) + 75, // 75-95
        assignedToId: assignedStaff?.id,
        createdById: admin.id,
      }
    })

    // Create history
    await prisma.leadStatusHistory.create({
      data: {
        leadId: lead.id,
        status: LeadStatus.AI_DRAFT,
        changedById: admin.id,
        timestamp: new Date(Date.now() - 86400000 * 2) // 2 days ago
      }
    })

    if (assignedStaff) {
      await prisma.leadStatusHistory.create({
        data: {
          leadId: lead.id,
          status: LeadStatus.ASSIGNED,
          changedById: admin.id,
          timestamp: new Date(Date.now() - 86400000) // 1 day ago
        }
      })
    }
  }

  // Create Attendance for today
  for (const emp of employees) {
    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: new Date(),
        checkInTime: new Date(new Date().setHours(9, 0, 0, 0)),
        status: AttendanceStatus.PRESENT
      }
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { prisma } from '@/lib/db/prisma'

export type AssignmentStrategy = 'ROUND_ROBIN' | 'WORKLOAD' | 'CATEGORY'

interface AssignmentResult {
  employeeId: string
  employeeName: string
  strategy: AssignmentStrategy
}

/**
 * Round Robin: assigns to the staff member who was assigned a lead the longest ago
 */
async function roundRobinAssign(): Promise<string | null> {
  const staff = await prisma.employee.findMany({
    where: { role: 'SALES_STAFF', active: true },
    include: {
      assignedLeads: {
        where: { status: { notIn: ['WON', 'LOST', 'REJECTED'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true }
      }
    }
  })

  if (staff.length === 0) return null

  // Sort by who received a lead least recently (or never)
  const sorted = staff.sort((a, b) => {
    const aLast = a.assignedLeads[0]?.createdAt?.getTime() ?? 0
    const bLast = b.assignedLeads[0]?.createdAt?.getTime() ?? 0
    return aLast - bLast
  })

  return sorted[0].id
}

/**
 * Workload Based: assigns to staff with fewest active leads
 */
async function workloadAssign(): Promise<string | null> {
  const staff = await prisma.employee.findMany({
    where: { role: 'SALES_STAFF', active: true },
    include: {
      _count: {
        select: {
          assignedLeads: true
        }
      }
    }
  })

  if (staff.length === 0) return null

  const sorted = staff.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads)
  return sorted[0].id
}

/**
 * Category Based: assigns based on lead category matching employee department
 */
async function categoryAssign(category: string | null): Promise<string | null> {
  if (!category) return null

  const categoryLower = category.toLowerCase()

  // Try to find a staff member whose department matches the category
  const match = await prisma.employee.findFirst({
    where: {
      role: 'SALES_STAFF',
      active: true,
      department: {
        contains: categoryLower,
        mode: 'insensitive'
      }
    }
  })

  if (match) return match.id

  // Fallback to workload-based if no category match
  return workloadAssign()
}

/**
 * Main assignment function — picks strategy based on settings
 * Defaults to ROUND_ROBIN for MVP
 */
export async function assignLead(
  leadId: string,
  strategy: AssignmentStrategy = 'ROUND_ROBIN',
  category?: string | null
): Promise<AssignmentResult | null> {
  let employeeId: string | null = null

  switch (strategy) {
    case 'ROUND_ROBIN':
      employeeId = await roundRobinAssign()
      break
    case 'WORKLOAD':
      employeeId = await workloadAssign()
      break
    case 'CATEGORY':
      employeeId = await categoryAssign(category ?? null)
      break
    default:
      employeeId = await roundRobinAssign()
  }

  if (!employeeId) return null

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, name: true }
  })

  if (!employee) return null

  // Update lead with assignment
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      assignedToId: employeeId,
      status: 'ASSIGNED'
    }
  })

  // Log status history
  await prisma.leadStatusHistory.create({
    data: {
      leadId,
      status: 'ASSIGNED',
    }
  })

  // Log activity
  await prisma.leadActivity.create({
    data: {
      leadId,
      type: 'LEAD_ASSIGNED',
      description: `Lead automatically assigned to ${employee.name} via ${strategy.replace('_', ' ')} strategy`,
      createdById: employeeId,
    }
  })

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    strategy
  }
}

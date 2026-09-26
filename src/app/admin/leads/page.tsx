import { prisma } from "@/lib/db/prisma"
import LeadsClient from "./LeadsClient"

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: { select: { name: true } },
    }
  })

  return <LeadsClient initialLeads={leads} />
}

import { prisma } from '@/lib/db/prisma'

export interface DuplicateMatch {
  id: string
  customerName: string | null
  phone: string | null
  status: string
  createdAt: Date
  matchType: 'EXACT_PHONE' | 'SIMILAR_PHONE' | 'SIMILAR_NAME'
  confidence: number
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0+/, '').slice(-10)
}

function nameSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const na = normalize(a)
  const nb = normalize(b)
  
  // Ignore very short or generic names like "customer", "unknown", or just a first name
  if (na.length < 4 || nb.length < 4) return 0
  if (na === 'customer' || nb === 'customer') return 0
  if (na === 'unknown' || nb === 'unknown') return 0

  if (na === nb) return 100

  // Token overlap
  const tokensA = new Set(na.split(/\s+/))
  const tokensB = new Set(nb.split(/\s+/))
  
  // Need at least 2 tokens to do overlap matching safely
  if (tokensA.size < 2 && tokensB.size < 2) return 0

  const intersection = [...tokensA].filter(t => tokensB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return Math.round((intersection / union) * 100)
}

export async function detectDuplicates(
  leadId: string,
  phone: string | null,
  customerName: string | null
): Promise<DuplicateMatch[]> {
  const matches: DuplicateMatch[] = []

  // Fetch all other leads
  const otherLeads = await prisma.lead.findMany({
    where: { id: { not: leadId }, status: { notIn: ['REJECTED'] } },
    select: { id: true, customerName: true, phone: true, status: true, createdAt: true },
  })

  for (const lead of otherLeads) {
    // Exact phone match
    if (phone && lead.phone) {
      const norm1 = normalizePhone(phone)
      const norm2 = normalizePhone(lead.phone)
      if (norm1 && norm2 && norm1 === norm2) {
        matches.push({ ...lead, matchType: 'EXACT_PHONE', confidence: 100 })
        continue
      }
    }

    // Similar name match (>= 70% overlap)
    if (customerName && lead.customerName) {
      const sim = nameSimilarity(customerName, lead.customerName)
      if (sim >= 70) {
        matches.push({ ...lead, matchType: 'SIMILAR_NAME', confidence: sim })
        continue
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}

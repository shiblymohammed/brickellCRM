import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export interface QualityFlags {
  missingCriticalFields: string[]
  lowConfidenceFields: string[]
  warnings: string[]
  overallScore: number // 0-100
  recommendation: 'APPROVE' | 'REVIEW' | 'REJECT'
}

export function scoreLeadQuality(extractedData: Record<string, any>, aiConfidence: number): QualityFlags {
  const criticalFields = ['customerName', 'phone', 'requirement']
  const importantFields = ['budget', 'location', 'timeline']

  const missingCritical = criticalFields.filter(f => !extractedData[f] || extractedData[f] === '')
  const missingImportant = importantFields.filter(f => !extractedData[f] || extractedData[f] === '')

  const warnings: string[] = []

  if (missingCritical.length > 0) {
    warnings.push(`Missing critical fields: ${missingCritical.join(', ')}`)
  }
  if (missingImportant.length > 0) {
    warnings.push(`Missing important fields: ${missingImportant.join(', ')}`)
  }
  if (aiConfidence < 60) {
    warnings.push('AI confidence is very low — manual verification strongly recommended')
  } else if (aiConfidence < 75) {
    warnings.push('AI confidence is below average — review extracted fields carefully')
  }

  // Score: start at AI confidence, penalize missing fields
  let score = aiConfidence
  score -= missingCritical.length * 15
  score -= missingImportant.length * 5
  score = Math.max(0, Math.min(100, score))

  let recommendation: 'APPROVE' | 'REVIEW' | 'REJECT' = 'APPROVE'
  if (missingCritical.length >= 2 || score < 40) {
    recommendation = 'REJECT'
  } else if (missingCritical.length > 0 || score < 65) {
    recommendation = 'REVIEW'
  }

  return {
    missingCriticalFields: missingCritical,
    lowConfidenceFields: missingImportant,
    warnings,
    overallScore: Math.round(score),
    recommendation,
  }
}

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest"
];

export async function generateLeadInsights(lead: {
  customerName?: string | null
  requirement?: string | null
  budget?: string | null
  summary?: string | null
  intent?: string | null
  leadTemperature?: string | null
}): Promise<string> {
  const prompt = `You are a sales assistant. Given this lead info, write a 1-2 sentence actionable insight for the sales staff:
Customer: ${lead.customerName || 'Unknown'}
Requirement: ${lead.requirement || 'Unknown'}
Budget: ${lead.budget || 'Unknown'}
Intent: ${lead.intent || 'Unknown'}
Temperature: ${lead.leadTemperature || 'Unknown'}
Summary: ${lead.summary || 'None'}

Write only the insight, no preamble.`

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })
      return (response.text ?? '').trim()
    } catch (error: any) {
      console.warn(`Quality Insight Model ${model} failed: ${error.message}. Trying fallback...`);
    }
  }

  return '' // If all fail, return no insight
}


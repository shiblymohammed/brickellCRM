import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Schema for a single extracted contact
export const contactSchema = z.object({
  name: z.string().nullable(),
  phone: z.string().nullable(),
});

// Schema for the full extraction result — a list of contacts
export const contactListSchema = z.object({
  contacts: z.array(contactSchema),
  totalFound: z.number(),
});

export type Contact = z.infer<typeof contactSchema>;
export type ContactList = z.infer<typeof contactListSchema>;

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest" // Broad fallback
];

export async function extractContactsFromGroupScreenshot(
  base64Images: string[]
): Promise<ContactList> {
  const prompt = `You are analyzing a screenshot of a WhatsApp group members list.

Your task: Extract ALL phone numbers and names visible in the screenshot.

Rules:
- Extract EVERY contact visible, even if there are 20+
- Phone numbers may appear with country codes (e.g. +91 98765 43210) — keep them as-is
- If a contact has a saved name, include it. If not, set name to null
- Do NOT skip any contact, even if the name is missing
- Return a JSON object with this exact structure:
{
  "contacts": [
    { "name": "John Smith", "phone": "+91 98765 43210" },
    { "name": null, "phone": "+91 87654 32109" },
    ...
  ],
  "totalFound": <number of contacts extracted>
}

Return only valid JSON, no markdown, no explanation.`;

  const imageParts = base64Images.map(base64Data => ({
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg" as const,
    }
  }));

  // 1. Try Gemini Models with fallbacks
  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`Attempting extraction with model: ${model}`);
      const response = await genAI.models.generateContent({
        model: model,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...imageParts,
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text ?? '';
      const cleaned = responseText
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      return contactListSchema.parse(parsed);
    } catch (error: any) {
      console.warn(`Model ${model} failed: ${error.message}. Trying next fallback...`);
    }
  }

  // 2. Final Fallback: OCR.space free API
  console.log("All Gemini models failed. Falling back to OCR.space API...");
  return await fallbackToOCR(base64Images);
}

// Fallback logic using standard OCR and regex
async function fallbackToOCR(base64Images: string[]): Promise<ContactList> {
  const contacts: Contact[] = [];
  const ocrApiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'; // 'helloworld' is the free public key, heavily rate-limited

  for (const base64 of base64Images) {
    try {
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
      formData.append('apikey', ocrApiKey);
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2'); // Engine 2 is usually better for numbers/special characters

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!data.ParsedResults) continue;

      const text = data.ParsedResults.map((r: any) => r.ParsedText).join('\n');
      
      // Regex to find phone numbers: e.g. +91 98765 43210, 9876543210, +1 (555) 555-5555
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const matches = text.match(phoneRegex);
      
      if (matches) {
        for (const match of matches) {
          contacts.push({ name: null, phone: match.trim() });
        }
      }
    } catch (e) {
      console.error("OCR Fallback failed:", e);
    }
  }
  
  // Deduplicate by phone
  const uniqueContactsMap = new Map();
  for (const c of contacts) {
    if (c.phone) {
      // normalize simple spaces for deduplication
      const cleanPhone = c.phone.replace(/\s+/g, '');
      uniqueContactsMap.set(cleanPhone, c);
    }
  }
  
  const uniqueContacts = Array.from(uniqueContactsMap.values());
  
  if (uniqueContacts.length === 0) {
    throw new Error("All AI models and OCR fallback failed to extract any contacts.");
  }
  
  return { 
    contacts: uniqueContacts, 
    totalFound: uniqueContacts.length 
  };
}

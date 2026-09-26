import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function list() {
  try {
    const models = await genAI.models.list();
    for await (const model of models) {
      console.log(model.name, model.supportedGenerationMethods);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

list();

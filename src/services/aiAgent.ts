import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProfileData } from "../types";

const SYSTEM_PROMPT = `
You are an expert AI agent tasked with building a highly accurate profile of a famous person.
You have access to Google Search. You must use the whole internet to find the most accurate and up-to-date information.
If any information is absolutely not publicly available after searching, you MUST output "Information not publicly available" for that field. Do not guess.

Return the profile strictly as a JSON object matching this schema:
{
  "name": "string",
  "executiveSummary": "string (1-2 paragraphs)",
  "basicDetails": {
    "fullName": "string",
    "nationality": "string",
    "currentRole": "string",
    "industry": "string",
    "currentCity": "string",
    "currentCountry": "string"
  },
  "biography": "string (2-3 paragraphs)",
  "careerTimeline": [
    { "year": "string", "role": "string", "organization": "string" }
  ],
  "education": [
    { "degree": "string", "institution": "string" }
  ],
  "interests": ["string"],
  "netWorth": "string",
  "recentNews": [
    { "title": "string", "description": "string", "date": "string (YYYY-MM-DD or YYYY)" }
  ],
  "references": [
    { "title": "string", "url": "string" }
  ],
  "photoUrl": "string (URL to a public photo, preferably Wikipedia/Wikimedia)"
}

Ensure all arrays have at least one item, or state "Information not publicly available" in the relevant fields if empty.
`;

export async function generateProfileWithGemini(name: string, context: string, apiKey: string): Promise<ProfileData> {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in Settings.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Use gemini-1.5-flash with Google Search Grounding for fast, internet-aware answers
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    tools: [
      {
        // @ts-ignore: Google Search Grounding is available in the API but might be missing in this SDK version's types
        googleSearch: {}
      }
    ]
  });

  const prompt = `Please build a comprehensive profile for ${name}. Context: ${context}. Use Google Search to find their most recent net worth, recent news, education, career timeline, and interests.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;

    const profile = JSON.parse(jsonString) as ProfileData;
    profile.generatedAt = new Date().toISOString();
    return profile;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate profile using Gemini. Check your API key or internet connection.");
  }
}

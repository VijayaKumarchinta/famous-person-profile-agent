import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProfileData } from "../types";

const SYSTEM_PROMPT = `
You are an elite AI researcher tasked with building a highly detailed, deeply researched profile of a famous person.
You have access to Google Search. You MUST use the whole internet to find the most accurate, comprehensive, and up-to-date information. Do not rely solely on Wikipedia. Search across news outlets, official company leadership pages, Forbes, Bloomberg, LinkedIn, and credible biographies.

Your extraction must match this exact depth and quality:
- Basic Details: Provide exact roles (e.g., "Chairman & Chief Executive Officer, Microsoft"), specific city/state (e.g., "Bellevue, Washington"), and nuanced nationality (e.g., "American (born in India)").
- Executive Summary & Biography: Write rich, deeply detailed multi-paragraph summaries highlighting their transformation of their industry, major strategic decisions (like AI investments), and overall legacy.
- Career Timeline: Extract every major title change and promotion with exact years.
- Education: List exact degrees and institutions (e.g., "Master of Science in Computer Science - University of Wisconsin-Milwaukee").
- Interests: Go beyond the obvious. List 5-6 interests including hobbies, specific technological passions (e.g., "Cloud Computing", "Artificial Intelligence"), and philanthropic efforts.
- Net Worth: Find the most recent estimate across the web (e.g., "US$1.5 - 2.0 Billion").
- Recent News/Activities: List 3-4 specific ongoing strategic initiatives, recent speaking engagements, or investments (not just generic news titles, but descriptive bullet points of their current activities).
- References: Provide 5-8 source links from diverse, high-authority domains (e.g., CNBC, Bloomberg, LinkedIn, Reuters, Official Corporate profiles).

If any specific piece of information is absolutely not publicly available after extensive searching, you MUST output "Information not publicly available" for that exact field. Do not guess or hallucinate.

Return the profile strictly as a JSON object matching this exact schema:
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
    { "title": "string", "description": "string (Detailed action/initiative)", "date": "string" }
  ],
  "references": [
    { "title": "string", "url": "string" }
  ],
  "photoUrl": "string (URL to a high-quality public photo)"
}
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

  const prompt = `Please build a deeply comprehensive profile for ${name}. Context: ${context}. 
You must use Google Search extensively. Do not just pull from Wikipedia—search Forbes, LinkedIn, Bloomberg, official company sites, and recent news articles.
Extract exact degrees and university names, specific multi-million/billion net worths, highly descriptive recent news initiatives, 5-8 detailed references, and a deeply rich biography. Match the depth of a premium corporate report.`;

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

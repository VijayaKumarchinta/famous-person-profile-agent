import { generateProfileWithGemini } from "./src/services/aiAgent";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: VITE_GEMINI_API_KEY is not set in the .env file.");
  console.error("Please add it to run the tests.");
  process.exit(1);
}

const PUBLIC_FIGURES = [
  "Elon Musk",
  "Tim Cook",
  "Sundar Pichai",
  "Taylor Swift",
  "Barack Obama",
  "Serena Williams",
  "Jensen Huang",
  "Oprah Winfrey",
  "Mark Zuckerberg",
  "Malala Yousafzai"
];

async function runTests() {
  console.log("🚀 Starting Profile Extraction Tests...");
  console.log("Using Deep Internet Search (Gemini + Google Search Grounding)\n");

  const outputDir = path.join(__dirname, "test_outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const name of PUBLIC_FIGURES) {
    console.log(`\n⏳ Extracting profile for: ${name}...`);
    try {
      const profile = await generateProfileWithGemini(name, "", API_KEY!);
      
      const filePath = path.join(outputDir, `${name.replace(/\s+/g, "_")}.json`);
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
      
      console.log(`✅ Success! Profile saved to test_outputs/${name.replace(/\s+/g, "_")}.json`);
      console.log(`   - Net Worth Extracted: ${profile.netWorth}`);
      console.log(`   - Career Timeline Entries: ${profile.careerTimeline?.length || 0}`);
      console.log(`   - Recent News Entries: ${profile.recentNews?.length || 0}`);
    } catch (error) {
      console.error(`❌ Failed to extract profile for ${name}:`, error);
    }
    
    // Sleep for 3 seconds to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log("\n🎉 All tests completed! Check the 'test_outputs' folder for the generated profiles.");
}

runTests();

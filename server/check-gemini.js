// Check Gemini API key and available models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

console.log("✅ API Key found:", apiKey.substring(0, 10) + "...");
console.log("\nTesting API key...\n");

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const modelsToTry = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "models/gemini-pro"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const text = result.response.text();
      console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...\n`);
      return modelName;
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
  
  console.log("❌ None of the models worked. Your API key might be invalid or restricted.");
  console.log("\nPlease:");
  console.log("1. Go to https://aistudio.google.com/app/apikey");
  console.log("2. Create a new API key");
  console.log("3. Update your .env file");
}

testModels();

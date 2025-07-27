import "dotenv/config.js";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveRelevantChunks } from "./retriever.js";
import { generateAnswer } from "./generator.js";

// Gemini for embedding the query
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getQueryEmbedding(query) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const res = await model.embedContent(query);
  return res.embedding.values;
}

async function askAvenBot(question) {
  console.log(`\n🤖 User: ${question}`);

  // 1️⃣ Get embedding for the user question
  const queryEmbedding = await getQueryEmbedding(question);

  // 2️⃣ Retrieve top relevant chunks from Pinecone
  const context = await retrieveRelevantChunks(queryEmbedding);
  console.log("📚 Retrieved context:", context);

  // 3️⃣ Generate an answer using Gemini with context
  const answer = await generateAnswer(question, context);

  console.log(`✅ AvenBot: ${answer}`);
}

// Simple CLI for testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Ask AvenBot: ", async (question) => {
  await askAvenBot(question);
  rl.close();
});

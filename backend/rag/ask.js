import "dotenv/config.js";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveRelevantChunks } from "./retriever.js";
import { generateAnswer } from "./generator.js";

const router = express.Router();

// Gemini for embedding the query
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getQueryEmbedding(query) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const res = await model.embedContent(query);
  return res.embedding.values;
}

// API endpoint for AvenBot
router.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    console.log(`🤖 User asked: ${query}`);

    // 1️⃣ Get embedding for the user question
    const queryEmbedding = await getQueryEmbedding(query);

    // 2️⃣ Retrieve top relevant chunks from Pinecone
    const context = await retrieveRelevantChunks(queryEmbedding);

    console.log("📚 Retrieved context:", context);

    // 3️⃣ Generate an answer using Gemini with context
    const answer = await generateAnswer(query, context);

    return res.json({
      query,
      answer: answer || "I’m not sure, please check with a human support agent.",
      context,
    });
  } catch (error) {
    console.error("❌ Error in ask route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

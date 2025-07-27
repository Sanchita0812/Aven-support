import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getQueryEmbedding(query) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const res = await model.embedContent(query);
  return res.embedding.values;
}

export async function retrieveRelevantChunks(query, topK = 5) {
  const queryEmbedding = await getQueryEmbedding(query);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true
  });

  return results.matches.map(match => ({
    score: match.score,
    text: match.metadata.text,
    source: match.metadata.source
  }));
}

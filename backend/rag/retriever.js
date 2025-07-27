import "dotenv/config.js";
import { Pinecone } from "@pinecone-database/pinecone";

// Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Your existing index
const index = pinecone.index(process.env.PINECONE_INDEX);

export async function retrieveRelevantChunks(queryEmbedding, topK = 8) {
  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    includeValues: false,
    includeMetadata: true,
  });

  // Filter out very low scores (<0.7) to avoid noise
  const filteredMatches = queryResponse.matches.filter(m => m.score > 0.7);

  // Extract clean text for Gemini
  const context = filteredMatches.map(m => ({
    text: m.metadata?.text || m.metadata?.chunk || m.metadata?.raw || "No text",
    source: m.metadata?.source || "Unknown"
  }));

  return context;
}

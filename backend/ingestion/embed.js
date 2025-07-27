import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pinecone client (new console doesn’t require environment)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get index reference directly
const index = pinecone.index(process.env.PINECONE_INDEX);

// Function to get Gemini embeddings
export async function getGeminiEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const res = await model.embedContent(text);
  return res.embedding.values; // array of floats
}

// Embed & store documents into Pinecone
export async function embedAndStore(documents, batchSize = 10) {
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);

    const vectors = [];
    for (const doc of batch) {
      const embedding = await getGeminiEmbedding(doc.text);

      vectors.push({
        id: doc.id,
        values: embedding,
        metadata: {
          text: doc.text,              // store the actual chunk text
          source: doc.metadata.source, // keep the source URL
          title: doc.metadata.title,   // optional: doc title if available
          timestamp: doc.metadata.timestamp // optional: timestamp
        },
      });
    }

    await index.upsert(vectors);
    console.log(
      `Uploaded ${vectors.length} chunks (${i + vectors.length}/${documents.length})`
    );
  }
}

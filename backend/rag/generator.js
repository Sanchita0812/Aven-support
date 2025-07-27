import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAnswer(userQuery, retrievedChunks) {
  // If no chunks retrieved
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return "I couldn’t find any relevant information in Aven’s support documentation. Please contact a human support agent.";
  }

  // Format retrieved context cleanly
  let formattedContext = retrievedChunks
    .map((chunk, idx) => {
      const source = chunk.metadata?.source || "Unknown source";
      const snippet = chunk.metadata?.text || chunk.text || "(no text)";
      return `(${idx + 1}) ${snippet.trim()} [Source: ${source}]`;
    })
    .join("\n\n");

  // Strong system prompt
  const systemPrompt = `You are Aven's AI support agent. 
You ONLY answer based on the provided context. 
If the answer is not explicitly in the context, say: 
"I couldn’t find this in Aven’s support documentation. Please contact a human support agent."
Always keep answers concise and include sources at the end like: (Source: aven.com/...)`;

  // Build full prompt for Gemini
  const finalPrompt = `
${systemPrompt}

Context:
${formattedContext}

User Question: ${userQuery}

Helpful Answer:
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(finalPrompt);

    const answer = result.response.text().trim();

    return answer;
  } catch (err) {
    console.error("Gemini API error:", err);
    return "I’m having trouble retrieving the answer. Please try again later.";
  }
}

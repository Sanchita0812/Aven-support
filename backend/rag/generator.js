import "dotenv/config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAnswer(question, contextChunks) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Combine retrieved chunks
  const contextText = contextChunks.map(c => `Source: ${c.source}\n${c.text}`).join("\n\n");

  const prompt = `
You are Aven's AI customer support assistant. 
You have access to the following knowledge base chunks from Aven's official support pages.

Context:
${contextText}

User question: "${question}"

Rules:
- If the context directly answers the question, give a clear, concise answer.
- If the context partially answers, provide the best possible answer and mention what’s missing.
- If the context has no relevant info, say: "I’m not sure, please check with a human support agent."

Now provide the best possible helpful answer:
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

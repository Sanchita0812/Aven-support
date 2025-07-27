import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAnswer(query, retrievedChunks) {
 
  const context = retrievedChunks.map((c) => `- ${c.text ?? ""}`).join("\n");

  const prompt = `
You are Aven's friendly support assistant.
Use ONLY the context below to answer the question.
If the answer is not in the context, say "I’m not sure, please check with a human support agent."

Context:
${context}

Question:
${query}

Answer in a clear, concise, and friendly tone. Add sources if available.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);

  return result.response.text();
}

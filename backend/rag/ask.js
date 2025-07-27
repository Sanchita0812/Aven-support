import { retrieveRelevantChunks } from "./retriever.js";
import { generateAnswer } from "./generator.js";

export async function askAvenBot(query) {
  console.log(`🤖 User: ${query}`);

  const retrievedChunks = await retrieveRelevantChunks(query);
  console.log("📚 Retrieved context:", retrievedChunks);

  const answer = await generateAnswer(query, retrievedChunks);
  console.log(`✅ AvenBot: ${answer}`);

  return answer;
}

// Quick test
askAvenBot("How can I reset my Aven account password?");

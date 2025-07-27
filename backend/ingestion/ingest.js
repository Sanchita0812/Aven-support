import "dotenv/config.js";
import { scrapeAvenSupport } from "./scrape.js";
import { prepareDocuments } from "./chunker.js";
import { embedAndStore } from "./embed.js";

async function runIngestion() {
  console.log("🚀 Starting Aven Support Ingestion");

  // 1️⃣ Scrape from Exa.ai
  const scraped = await scrapeAvenSupport();

  // 2️⃣ Chunk into ~300-token pieces
  const docs = prepareDocuments(scraped);
  console.log(`✅ Created ${docs.length} chunks`);

  // 3️⃣ Embed with Gemini + store in Pinecone
  await embedAndStore(docs);

  console.log("🎉 Ingestion pipeline complete!");
}

runIngestion();

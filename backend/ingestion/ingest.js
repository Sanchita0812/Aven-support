import "dotenv/config.js";
import { scrapeAvenSupport } from "./scrape.js";
import { prepareDocuments } from "./chunker.js";
import { embedAndStore } from "./embed.js";

async function runIngestion() {
  console.log("Starting Aven Support Ingestion...");

  // 1️⃣ Scrape all Aven support content
  console.log("Scraping Aven support docs...");
  const scrapedContent = await scrapeAvenSupport();
  if (!scrapedContent || scrapedContent.length === 0) {
    console.error("No content scraped. Check scraper.");
    return;
  }
  console.log(`Scraped ${scrapedContent.length} pages.`);

  // 2️⃣ Chunk into ~200–300 token pieces (FAQ-style chunks)
  console.log("Splitting into FAQ-sized chunks...");
  const docs = prepareDocuments(scrapedContent);
  console.log(`Prepared ${docs.length} focused chunks for embedding.`);

  // 3️⃣ Embed with Gemini + store in Pinecone
  console.log("Generating embeddings & storing in Pinecone...");
  await embedAndStore(docs, 10);

  console.log("Ingestion pipeline complete!");
}

runIngestion().catch(err => {
  console.error("❌ Ingestion failed:", err);
});

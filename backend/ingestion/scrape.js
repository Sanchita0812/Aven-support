import Exa from "exa-js";
import dotenv from "dotenv";
dotenv.config();

const exa = new Exa(process.env.EXA_API_KEY);

export async function scrapeAvenSupport() {
  console.log("🔍 Searching Exa.ai for Aven support pages...");

  const searchResults = await exa.searchAndContents(
    "site:aven.com/support OR site:help.aven.com",
    {
      numResults: 20,  // adjust if needed
      text: true,
    }
  );

  const docs = searchResults.results.map(r => ({
    title: r.title,
    content: r.text,
    url: r.url
  }));

  console.log(`✅ Retrieved ${docs.length} support articles`);
  return docs;
}

// Test it standalone
if (process.argv[1].includes("scrape.js")) {
  const docs = await scrapeAvenSupport();
  console.log(docs.slice(0, 2));
}

import { v4 as uuidv4 } from "uuid";

export function prepareDocuments(scrapedPages) {
  const docs = [];
  const MAX_CHUNK_SIZE = 1200; // ~300 tokens (approx 4 chars/token)

  scrapedPages.forEach(page => {
    const { url, content } = page;

    // 1. Pre-split by FAQ markers or paragraphs
    let initialChunks = content
      .split(/\n-\s|\n###|\n\*\*|\n\n/g) // split by markers OR paragraph breaks
      .map(c => c.trim())
      .filter(c => c.length > 50);

    // 2. Further chunk if too long (> 1200 chars)
    const safeChunks = [];
    initialChunks.forEach(chunk => {
      if (chunk.length > MAX_CHUNK_SIZE) {
        // Split long text into smaller parts
        for (let i = 0; i < chunk.length; i += MAX_CHUNK_SIZE) {
          safeChunks.push(chunk.slice(i, i + MAX_CHUNK_SIZE));
        }
      } else {
        safeChunks.push(chunk);
      }
    });

    // 3. Create final documents with metadata
    safeChunks.forEach(chunk => {
      docs.push({
        id: uuidv4(),
        text: chunk,
        metadata: {
          source: url,
          timestamp: new Date().toISOString()
        }
      });
    });
  });

  return docs;
}

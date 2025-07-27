import { v4 as uuidv4 } from "uuid";

export function prepareDocuments(scrapedPages) {
  const docs = [];

  scrapedPages.forEach(page => {
    const { url, content } = page;

    // Split by FAQ/question markers or bullet points
    const faqChunks = content
      .split(/\n-\s|\n###|\n\*\*/g) // split by new FAQ/bullet markers
      .map(c => c.trim())
      .filter(c => c.length > 50); // ignore tiny lines

    faqChunks.forEach(chunk => {
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

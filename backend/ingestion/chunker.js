export function chunkText(text, chunkSize = 300) {
    const sentences = text.split(". ");
    let chunks = [];
    let currentChunk = "";
  
    for (let sentence of sentences) {
      if ((currentChunk + sentence).split(" ").length > chunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + ". ";
      } else {
        currentChunk += sentence + ". ";
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  }
  
  export function prepareDocuments(scrapedArticles) {
    let documents = [];
    scrapedArticles.forEach(article => {
      const chunks = chunkText(article.content, 300);
      chunks.forEach((chunk, idx) => {
        documents.push({
          id: `${article.url}#${idx}`,
          text: chunk,
          metadata: {
            title: article.title,
            source: article.url,
            chunk: idx,
            timestamp: new Date().toISOString()
          }
        });
      });
    });
    return documents;
  }
  
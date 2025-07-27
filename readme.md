Aven AI Customer Support AgentThis repository contains the source code for an AI-powered Customer Support Agent for the startup Aven. The agent provides fast, accurate, and friendly responses to user inquiries through both voice and text chat, leveraging a Retrieval-Augmented Generation (RAG) architecture to ensure its answers are grounded in Aven's official documentation.Live DemoA link to the live project demo can be found here: Project Demo on YouTubeFeaturesConversational AI Chat: A dynamic web interface where users can interact with the AI agent via text or voice.Retrieval-Augmented Generation (RAG): The agent uses a sophisticated RAG pipeline to retrieve relevant information from a specialized knowledge base, ensuring answers are accurate and context-aware.Voice-Enabled Interaction: Full voice chat functionality powered by the Vapi SDK, allowing users to speak their questions and hear spoken responses.Source Citations: Every answer is accompanied by links to the source documents, providing transparency and allowing users to verify the information.Scalable Data Ingestion: A robust data pipeline to scrape, chunk, embed, and store Aven's support documentation in a Pinecone vector database.Safety Guardrails (Bonus): The agent is designed to detect and appropriately handle sensitive queries, including requests for personal data, legal/financial advice, and toxic language.Tool Calling for Scheduling (Bonus): The agent can understand intents to schedule meetings and call an external API to book a time, confirming the details with the user.ArchitectureThe project is built on a modern RAG architecture that separates the data pipeline, the AI backend, and the user-facing frontend.graph TD
    A[User on Next.js Frontend] -- Text/Voice Query --> B{API Route};
    B -- Processed Query --> C[RAG Backend];
    C -- Embed Query --> D[Pinecone Vector DB];
    D -- Returns Relevant Docs --> C;
    C -- Augmented Prompt --> E[Google Gemini LLM];
    E -- Streams Answer & Citations --> B;
    B -- Streams to UI --> A;
    subgraph Voice Pipeline
        V1[Vapi SDK] <--> A;
        V1 -- Transcript --> B;
        B -- Text-to-Speech --> V1;
    end
    subgraph Data Ingestion
        F[Aven Support Docs] --> G[Scraper];
        G --> H[Chunker];
        H --> I[Embedder];
        I --> D;
    end
Data Ingestion: Aven's support documentation is scraped, chunked, and converted into vector embeddings, then stored in a Pinecone database.User Interaction: The user asks a question on the Next.js web app via text or voice (handled by Vapi).RAG Backend: The query is sent to the backend, which embeds it and queries Pinecone to find the most relevant document chunks.LLM Generation: These chunks are combined with the user's query into a prompt for a Google Gemini model, which generates a helpful, grounded answer.Streaming Response: The answer and its source citations are streamed back to the user interface.Tech StackFrontend: Next.js, React, Tailwind CSSBackend: Node.js / Next.js API RoutesAI & LLM: Google AI (Gemini, Embeddings)Voice: VapiVector Database: PineconeWeb Scraping: Playwright or another scraping toolGetting StartedFollow these steps to set up and run the project locally.PrerequisitesNode.js (v18 or later)npm, yarn, or pnpmAn account and API keys for:Google AI (for Gemini)PineconeVapi1. Clone the Repositorygit clone https://github.com/Sanchita0812/Aven-support.git
cd Aven-support
2. Install DependenciesInstall the required packages for the project.npm install
3. Set Up Environment VariablesCreate a .env.local file in the root of the project. Fill in your API keys as shown below.# .env.local

# Google AI
GEMINI_API_KEY="your-gemini-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"
PINECONE_INDEX_NAME="aven-support"

# Vapi
VAPI_API_KEY="your-vapi-api-key"
4. Run the Data Ingestion PipelineBefore starting the app, you need to populate your Pinecone database with Aven's support documentation.node backend/ingestion/ingest.js
This script will scrape, chunk, embed, and upload the data. This only needs to be run once or whenever the source documentation changes.5. Start the ApplicationYou can now start the Next.js development server.npm run dev
Open http://localhost:3000 in your browser to see the application running.EvaluationTo ensure the agent's quality, an evaluation set of approximately 50 realistic user questions was created. The agent's responses were scored across three key metrics:Accuracy: Is the answer factually correct according to Aven's documentation?Helpfulness: Does the answer directly and clearly address the user's question?Citation Quality: Are the provided source links relevant and correct?This rigorous evaluation process helps benchmark the agent's performance and identify areas for improvement. The evaluation files can be found in the /evaluation directory.
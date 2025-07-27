import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { askAvenBot } from "./rag/ask.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => res.send("✅ RAG Backend Running"));

// Main ask endpoint
app.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;
    const answer = await askAvenBot(query);
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Backend error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import the ask router (your ask.js)
import askRouter from "./ask.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("✅ RAG Backend Running"));

// Mount the ask.js router at /api
app.use("/api", askRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

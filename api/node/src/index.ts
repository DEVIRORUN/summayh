// api/node/src/index.ts

import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Mount our routes
app.use("/api/auth", authRoutes);

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Summayh Engine running on http://localhost:${PORT}`);
});
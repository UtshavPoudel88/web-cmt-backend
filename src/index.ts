// src/index.ts
import "dotenv/config";

import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
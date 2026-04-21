import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import cvRoutes from "./routes/cv.js";
import analyzeRoutes from "./routes/analyze.js";
import paymentRoutes from "./routes/payment.js";
import jobRoutes from "./routes/jobs.js";
import cvBuilderRoutes from "./routes/cv-builder.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("CareerUpdater API is running!"));
app.get("/health", (req, res) => res.status(200).json({ status: "alive" }));

app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/cv-builder", cvBuilderRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
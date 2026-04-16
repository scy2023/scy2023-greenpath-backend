import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import cvRoutes from "./routes/cv.js";
import analyzeRoutes from "./routes/analyze.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

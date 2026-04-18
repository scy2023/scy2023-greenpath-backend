import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { cvData, role } = req.body;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(
    `Compare CV with role ${role}. Return JSON with match_score and missing_skills.\n${cvData}`
  );
  res.json(JSON.parse(result.response.text()));
});

export default router;
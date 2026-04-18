import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { cvData, role } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Compare this CV with the role: ${role}. CV: ${cvData}.
       Respond with ONLY valid JSON:
       {"match_score": 75, "missing_skills": ["Python", "AWS"]}`
    );
    const raw = result.response.text();
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("Analyze Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
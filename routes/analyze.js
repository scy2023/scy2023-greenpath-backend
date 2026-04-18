import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { cvData, role } = req.body;
    const result = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{
        role: "user",
        content: `Compare this CV with the role "${role}". Return ONLY a JSON object with match_score (number 0-100) and missing_skills (array of strings). No extra text.\n\nCV:\n${cvData}`
      }],
    });
    const text = result.choices[0].message.content;
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    res.json(json);
  } catch (err) {
    console.error("Analyze Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
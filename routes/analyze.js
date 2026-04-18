import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { cvData, role } = req.body;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{
          role: "user",
          content: `Compare this CV with the role "${role}". Return ONLY a JSON object with match_score (number 0-100) and missing_skills (array of strings). No extra text.\n\nCV:\n${cvData}`
        }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
const json = JSON.parse(cleaned.match(/\{[\s\S]*\}/)[0]);
    res.json(json);
  } catch (err) {
    console.error("Analyze Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
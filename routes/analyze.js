import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { cvData, role } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{
          role: "user",
          content: `Compare this CV with the role: ${role}. CV: ${cvData}. Respond with ONLY valid JSON: {"match_score": 75, "missing_skills": ["Python", "AWS"]}`
        }]
      })
    });

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("Analyze Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
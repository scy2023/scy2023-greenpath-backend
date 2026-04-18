import express from "express";
import multer from "multer";
import { default as pdfParse } from "pdf-parse/lib/pdf-parse.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const pdf = await pdfParse(req.file.buffer);
    const text = pdf.text.slice(0, 3000);

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
          content: `Extract skills, experience and education from this CV. Return as JSON only: {"skills": [], "experience": [], "education": []}\n\nCV:\n${text}`
        }]
      })
    });

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json({ cvData: clean });
  } catch (err) {
    console.error("CV Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
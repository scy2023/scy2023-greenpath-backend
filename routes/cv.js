import express from "express";
import multer from "multer";
import Groq from "groq-sdk";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const text = req.file.buffer.toString("utf-8");

    const result = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: `Extract skills from this CV:\n${text}` }],
    });

    res.json({ cvData: result.choices[0].message.content });
  } catch (err) {
    console.error("CV Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
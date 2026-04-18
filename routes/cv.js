import express from "express";
import multer from "multer";
import Groq from "groq-sdk";
import pdf from "pdf-parse";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    // ✅ Correct PDF parsing
    const data = await pdf(req.file.buffer);
    const text = data.text;

    // ✅ Use valid model
    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Extract skills from this CV:\n${text}`,
        },
      ],
    });

    res.json({ cvData: result.choices[0].message.content });

  } catch (err) {
    console.error("CV Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from "express";
import multer from "multer";
import Groq from "groq-sdk";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    // ✅ Parse PDF properly
    const pdf = await pdfParse(req.file.buffer);
    const text = pdf.text;

    // ✅ Use working model
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
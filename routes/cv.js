import express from "express";
import multer from "multer";
import { createRequire } from "module";
import Groq from "groq-sdk";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const pdf = await pdfParse(req.file.buffer);
    const result = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: `Extract skills from this CV:\n${pdf.text}` }],
    });
    res.json({ cvData: result.choices[0].message.content });
  } catch (err) {
    console.error("CV Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
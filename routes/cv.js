import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: req.file.buffer.toString("base64")
        }
      },
      "Extract skills, experience and education from this CV. Return as JSON: {\"skills\": [], \"experience\": [], \"education\": []}"
    ]);
    
    const raw = result.response.text();
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json({ cvData: clean });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
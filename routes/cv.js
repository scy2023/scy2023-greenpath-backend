import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const text = req.file.buffer.toString("utf-8");
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: `Extract skills from this CV:\n${text}` }]
      })
    });
    const data = await response.json();
    console.log("DeepSeek response:", JSON.stringify(data));
if (!data.choices) return res.status(500).json({ error: "API error", details: data });
res.json({ cvData: data.choices[0].message.content });
  } catch (err) {
    console.error("CV Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
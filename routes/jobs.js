import express from "express";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { keywords, location, distancefromlocation = 5 } = req.query;

    const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&distancefromlocation=${distancefromlocation}&resultsToTake=10`;

    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.REED_API_KEY + ":").toString("base64")
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Jobs Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
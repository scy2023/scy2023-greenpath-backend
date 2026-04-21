import express from "express";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { keywords, location, distancefromlocation = 5 } = req.query;

    // Add postedByRecruitmentAgency=false and filter recent jobs
    const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&distancefromlocation=${distancefromlocation}&resultsToTake=20&minimumSalary=0`;

    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.REED_API_KEY + ":").toString("base64")
      }
    });

    const data = await response.json();

    // Filter out expired jobs
    const today = new Date();
    const activeJobs = (data.results || []).filter(job => {
      if (!job.expirationDate) return true;
      return new Date(job.expirationDate) >= today;
    });

    res.json({ results: activeJobs });
  } catch (err) {
    console.error("Jobs Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from "express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const router = express.Router();

// Generate CV content using DeepSeek
router.post("/generate", async (req, res) => {
  try {
    const { jobDescription, existingCV, userDetails, mode } = req.body;

    let prompt = "";

    if (mode === "rewrite" && existingCV) {
      prompt = `You are a professional CV writer. Rewrite and optimize this CV for the following job description.
      
Job Description:
${jobDescription}

Existing CV:
${existingCV}

Return ONLY a JSON object with this exact structure (no extra text):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "linkedin": "linkedin url or empty",
  "summary": "2-3 sentence professional summary tailored to the job",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "dates": "Jan 2020 - Present",
      "bullets": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "dates": "2015 - 2019"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"]
}`;
    } else {
      prompt = `You are a professional CV writer. Create an ATS-optimized CV for this person applying to the job below.

Job Description:
${jobDescription}

Person Details:
${JSON.stringify(userDetails)}

Return ONLY a JSON object with this exact structure (no extra text):
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "location": "City, Country",
  "linkedin": "linkedin url or empty",
  "summary": "2-3 sentence professional summary tailored to the job",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "dates": "Jan 2020 - Present",
      "bullets": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "dates": "2015 - 2019"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"]
}`;
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const cvData = JSON.parse(cleaned.match(/\{[\s\S]*\}/)[0]);

    res.json({ cvData });
  } catch (err) {
    console.error("CV Builder Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF from CV data
router.post("/pdf", async (req, res) => {
  try {
    const { cvData } = req.body;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 30px 40px; }
  h1 { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .contact { font-size: 10px; color: #333; margin: 6px 0 16px; }
  .contact span { margin-right: 12px; }
  hr { border: none; border-top: 2px solid #000; margin: 8px 0; }
  .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase;
    letter-spacing: 1px; margin: 14px 0 6px; border-bottom: 1px solid #000; padding-bottom: 3px; }
  .summary { font-size: 11px; line-height: 1.5; margin-bottom: 4px; }
  .job { margin-bottom: 10px; }
  .job-header { display: flex; justify-content: space-between; }
  .job-title { font-weight: bold; font-size: 11px; }
  .job-dates { font-size: 10px; color: #444; }
  .job-company { font-size: 10px; color: #333; margin: 1px 0 3px; }
  .job-bullets { padding-left: 16px; }
  .job-bullets li { font-size: 10px; line-height: 1.5; margin-bottom: 2px; }
  .edu-item { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .edu-left { font-size: 11px; }
  .edu-degree { font-weight: bold; }
  .edu-school { color: #333; font-size: 10px; }
  .edu-dates { font-size: 10px; color: #444; }
  .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }
  .skill { font-size: 10px; border: 1px solid #000; padding: 2px 8px; }
  .cert { font-size: 10px; margin-bottom: 3px; }
</style>
</head>
<body>
  <h1>${cvData.name || ""}</h1>
  <div class="contact">
    ${cvData.email ? `<span>✉ ${cvData.email}</span>` : ""}
    ${cvData.phone ? `<span>📞 ${cvData.phone}</span>` : ""}
    ${cvData.location ? `<span>📍 ${cvData.location}</span>` : ""}
    ${cvData.linkedin ? `<span>🔗 ${cvData.linkedin}</span>` : ""}
  </div>
  <hr/>

  ${cvData.summary ? `
  <div class="section-title">Professional Summary</div>
  <div class="summary">${cvData.summary}</div>
  ` : ""}

  ${cvData.experience && cvData.experience.length > 0 ? `
  <div class="section-title">Work Experience</div>
  ${cvData.experience.map(exp => `
    <div class="job">
      <div class="job-header">
        <span class="job-title">${exp.title}</span>
        <span class="job-dates">${exp.dates}</span>
      </div>
      <div class="job-company">${exp.company}</div>
      <ul class="job-bullets">
        ${(exp.bullets || []).map(b => `<li>${b}</li>`).join("")}
      </ul>
    </div>
  `).join("")}
  ` : ""}

  ${cvData.education && cvData.education.length > 0 ? `
  <div class="section-title">Education</div>
  ${cvData.education.map(edu => `
    <div class="edu-item">
      <div class="edu-left">
        <div class="edu-degree">${edu.degree}</div>
        <div class="edu-school">${edu.institution}</div>
      </div>
      <div class="edu-dates">${edu.dates}</div>
    </div>
  `).join("")}
  ` : ""}

  ${cvData.skills && cvData.skills.length > 0 ? `
  <div class="section-title">Skills</div>
  <div class="skills-list">
    ${cvData.skills.map(s => `<span class="skill">${s}</span>`).join("")}
  </div>
  ` : ""}

  ${cvData.certifications && cvData.certifications.length > 0 ? `
  <div class="section-title">Certifications</div>
  ${cvData.certifications.map(c => `<div class="cert">• ${c}</div>`).join("")}
  ` : ""}

</body>
</html>`;

    res.json({ html });
  } catch (err) {
    console.error("PDF Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
// Resume tailoring module
// Uses Gemini to rewrite resume for each specific job
// NEVER changes personal details — they are locked

const { callGemini } = require("./ai");

/**
 * Tailor a resume for a specific job using Gemini
 * @param {string} resumeText - Original resume text
 * @param {object} job - Job object from DB
 * @param {object} applicant - Extracted applicant details (name, email, phone, links)
 * @returns {string} - Tailored resume text
 */
async function tailorResume(resumeText, job, applicant = {}) {
  const lockedFields = [
    applicant.name ? `Name: ${applicant.name}` : null,
    applicant.email ? `Email: ${applicant.email}` : null,
    applicant.phone ? `Phone: ${applicant.phone}` : null,
    applicant.linkedin ? `LinkedIn: ${applicant.linkedin}` : null,
    applicant.portfolio ? `Portfolio: ${applicant.portfolio}` : null,
    applicant.github ? `GitHub: ${applicant.github}` : null,
    applicant.location ? `Location: ${applicant.location}` : null,
    applicant.education ? `Education: ${applicant.education}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert ATS resume optimizer. Rewrite the resume below tailored for a specific job.

═══════════════════════════════════════
LOCKED PERSONAL DETAILS (COPY EXACTLY — DO NOT CHANGE):
${lockedFields || 'Use exactly what appears in the original resume'}
═══════════════════════════════════════

TARGET JOB:
- Company: ${job.company}
- Title: ${job.title}
- Description: ${job.description}
- Location: ${job.location}

ORIGINAL RESUME:
${resumeText.substring(0, 4000)}

═══════════════════════════════════════
STRICT RULES:
1. The FIRST LINE must be the person's real name: "${applicant.name || '(use name from resume)'}"
2. The SECOND LINE must be their real contact info (email, phone, links) — copy exactly from above
3. NEVER invent or change the name, email, phone, LinkedIn, GitHub, portfolio, or education institution
4. Only rewrite: Summary/Objective, Skills list, and Experience bullet points
5. Add relevant keywords from the job description naturally
6. Keep it professional, concise, ATS-optimized
7. Maintain clear section headers: SUMMARY, EXPERIENCE, EDUCATION, SKILLS
8. Use bullet points (•) for experience items
═══════════════════════════════════════

Return ONLY the tailored resume text. No markdown formatting.`;

  try {
    const tailored = await callGemini(prompt);
    return tailored.trim();
  } catch (err) {
    console.error("Tailor error:", err.message);
    return resumeText; // Return original on failure
  }
}

module.exports = { tailorResume };

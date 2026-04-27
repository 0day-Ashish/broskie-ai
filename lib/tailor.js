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

  const prompt = `You are a strict ATS Resume Optimizer. Your job is to rewrite the PROFESSIONAL CONTENT of a resume while keeping PERSONAL IDENTITY locked.

═══════════════════════════════════════
LOCKED IDENTITY (USE THIS EXACTLY):
- NAME: ${applicant.name || 'Candidate'}
- CONTACT: ${[applicant.email, applicant.phone, applicant.location].filter(Boolean).join(' | ')}
- LINKS: ${[applicant.linkedin, applicant.portfolio, applicant.github].filter(Boolean).join(' | ')}
═══════════════════════════════════════

STRICT IDENTITY RULES:
1. The VERY FIRST LINE of the response MUST be: ${applicant.name || 'Candidate'}
2. The SECOND LINE MUST list the CONTACT and LINKS from above.
3. NEVER use names like "Arddev Sharma" or any other name unless it is explicitly provided in the LOCKED IDENTITY section above.
4. If you see a different name in the ORIGINAL RESUME below, IGNORE IT. Use the LOCKED IDENTITY name.
5. NEVER invent links, emails, or phone numbers.

REWRITING RULES:
1. Tailor the SUMMARY, EXPERIENCE, and SKILLS for this job:
   Company: ${job.company}
   Role: ${job.title}
   Description: ${job.description}

2. Use strong action verbs and match keywords from the job description.
3. Do not use Markdown (no **, no ##). Use plain text with clear headers: SUMMARY, EXPERIENCE, EDUCATION, SKILLS.
4. Use bullet points (•) for experience.

ORIGINAL RESUME FOR CONTENT:
${resumeText.substring(0, 4000)}

Return ONLY the tailored resume text.`;

  try {
    const tailored = await callGemini(prompt);
    return tailored.trim();
  } catch (err) {
    console.error("Tailor error:", err.message);
    return resumeText; // Return original on failure
  }
}

module.exports = { tailorResume };

// Job matching module
// Uses Gemini to rank jobs by relevance to user query + resume

const { callGeminiJSON } = require("./ai");

/**
 * Match and rank jobs using Gemini AI
 * @param {string} query - User's job search query
 * @param {string} resumeText - User's resume text
 * @param {Array} jobs - Array of job objects from DB
 * @returns {Array} - Top 5 matched jobs with scores
 */
async function matchJobs(query, resumeText, jobs) {
  const jobList = jobs.map(j => ({
    id: j.id,
    company: j.company,
    title: j.title,
    description: j.description,
    location: j.location,
    category: j.category
  }));

  const prompt = `You are a job matching AI. Given a user's search query and resume, rank the following jobs by relevance.

USER QUERY: "${query}"

USER RESUME (summary):
${resumeText.substring(0, 2000)}

AVAILABLE JOBS:
${JSON.stringify(jobList, null, 2)}

INSTRUCTIONS:
- Rank ALL jobs by how well they match the query AND resume
- Return the top 5 most relevant jobs
- Assign a matchScore from 0-100 for each (100 = perfect match)
- Consider: role relevance, skills match, location preference, experience level
- Be strict — only high scores for genuinely good matches

Return ONLY a valid JSON array (no extra text):
[
  { "id": 1, "matchScore": 92, "reason": "one-line reason" },
  ...
]`;

  try {
    const matches = await callGeminiJSON(prompt);
    
    // Merge match data with full job objects
    return matches.map(match => {
      const job = jobs.find(j => j.id === match.id);
      if (!job) return null;
      return {
        ...job,
        matchScore: match.matchScore,
        matchReason: match.reason
      };
    }).filter(Boolean);
  } catch (err) {
    console.error("Match error:", err.message);
    // Fallback: return first 5 jobs with default scores
    return jobs.slice(0, 5).map((job, i) => ({
      ...job,
      matchScore: 70 - (i * 5),
      matchReason: "Fallback match — AI unavailable"
    }));
  }
}

module.exports = { matchJobs };

// Application simulation module
// Simulates the act of applying to a job

/**
 * Simulate applying to a job
 * Adds a realistic delay to mimic real submission
 * @param {object} job - Job object
 * @param {string} tailoredResume - The tailored resume text
 * @returns {object} - Application result
 */
async function simulateApply(job, tailoredResume) {
  // Simulate network delay (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simulate success (95% success rate for realism)
  const success = Math.random() > 0.05;

  return {
    company: job.company,
    role: job.title,
    status: success ? "applied" : "failed",
    appliedAt: new Date().toISOString(),
    resumeLength: tailoredResume.length
  };
}

module.exports = { simulateApply };

// Job source module
// Fetches jobs from the Neon Postgres database — no hardcoded data

const { sql } = require("./db");

/**
 * Get all jobs from the database
 * @returns {Array} - Array of job objects
 */
async function getAllJobs() {
  const jobs = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
  return jobs;
}

/**
 * Get a job by its ID
 * @param {number} id
 * @returns {object|null}
 */
async function getJobById(id) {
  const result = await sql`SELECT * FROM jobs WHERE id = ${id}`;
  return result[0] || null;
}

module.exports = { getAllJobs, getJobById };

const { neon } = require("@neondatabase/serverless");
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkResults() {
  console.log("🔍 Checking latest agent results...");
  const results = await sql`
    SELECT id, run_id, user_id, tailored_resume 
    FROM agent_results 
    ORDER BY created_at DESC 
    LIMIT 5
  `;
  
  results.forEach(r => {
    console.log(`\n--- Result ID: ${r.id} (Run: ${r.run_id}, User: ${r.user_id}) ---`);
    console.log(r.tailored_resume.substring(0, 200));
  });
}

checkResults();

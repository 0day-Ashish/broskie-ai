import { NextResponse } from "next/server";

const { getAllJobs } = require("@/lib/jobs");
const { matchJobs } = require("@/lib/match");
const { tailorResume } = require("@/lib/tailor");
const { simulateApply } = require("@/lib/apply");
const { sql } = require("@/lib/db");

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, resumeText, userId, applicant } = body;

    if (!query || !resumeText) {
      return NextResponse.json(
        { error: "Both 'query' and 'resumeText' are required" },
        { status: 400 }
      );
    }

    console.log(`\n🚀 [AGENT] Starting run for query: "${query}"`);
    if (applicant?.name) console.log(`👤 [AGENT] Applicant: ${applicant.name}`);

    // Step 1: Fetch jobs from database
    console.log("📦 [STEP 1] Fetching jobs from database...");
    const allJobs = await getAllJobs();
    console.log(`   Found ${allJobs.length} jobs in database`);

    if (allJobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs found in database. Please initialize DB first." },
        { status: 404 }
      );
    }

    // Step 2: Match jobs using Gemini AI
    console.log("🧠 [STEP 2] Matching jobs with Gemini AI...");
    const matchedJobs = await matchJobs(query, resumeText, allJobs);
    console.log(`   Matched ${matchedJobs.length} jobs`);

    // Step 3: Create agent run record in DB
    const parsedUserId = userId ? parseInt(userId) : null;
    let runId = null;

    try {
      const runResult = await sql`
        INSERT INTO agent_runs (user_id, query, total_jobs_scanned, total_applied)
        VALUES (${parsedUserId}, ${query}, ${allJobs.length}, 0)
        RETURNING id
      `;
      runId = runResult[0].id;
      console.log(`📝 [DB] Created agent run #${runId}`);
    } catch (dbErr) {
      console.error("DB run insert error:", dbErr.message);
    }

    // Step 4: Agent loop — tailor resume + apply for each match
    console.log("⚡ [STEP 3] Running agent loop...");
    const results = [];
    let appliedCount = 0;

    for (const job of matchedJobs) {
      console.log(`   → Processing: ${job.title} at ${job.company}`);

      // Tailor resume
      console.log(`     ✏️  Tailoring resume for ${applicant?.name || 'applicant'}...`);
      const tailoredResume = await tailorResume(resumeText, job, applicant);

      // Apply
      console.log(`     📨 Applying...`);
      const appResult = await simulateApply(job, tailoredResume);
      if (appResult.status === "applied") appliedCount++;

      const resultObj = {
        id: job.id,
        company: job.company,
        role: job.title,
        location: job.location,
        matchScore: job.matchScore,
        matchReason: job.matchReason,
        status: appResult.status,
        appliedAt: appResult.appliedAt,
        tailoredResume: tailoredResume
      };

      // Save each result to DB
      if (runId) {
        try {
          const inserted = await sql`
            INSERT INTO agent_results (run_id, user_id, job_id, company, role, location, match_score, match_reason, status, tailored_resume)
            VALUES (${runId}, ${parsedUserId}, ${job.id}, ${job.company}, ${job.title}, ${job.location}, ${job.matchScore}, ${job.matchReason}, ${appResult.status}, ${tailoredResume})
            RETURNING id
          `;
          resultObj.resultId = inserted[0].id;
        } catch (dbErr) {
          console.error("DB result insert error:", dbErr.message);
        }
      }

      results.push(resultObj);
      console.log(`     ✅ ${appResult.status.toUpperCase()} (score: ${job.matchScore})`);
    }

    // Update total applied count
    if (runId) {
      try {
        await sql`UPDATE agent_runs SET total_applied = ${appliedCount} WHERE id = ${runId}`;
      } catch (dbErr) {
        console.error("DB update error:", dbErr.message);
      }
    }

    console.log(`\n🏁 [AGENT] Complete. Applied to ${appliedCount} jobs.\n`);

    return NextResponse.json({
      success: true,
      runId,
      query,
      totalJobsScanned: allJobs.length,
      totalApplied: appliedCount,
      results
    });

  } catch (error) {
    console.error("❌ [AGENT] Error:", error);
    return NextResponse.json(
      { error: "Agent execution failed: " + error.message },
      { status: 500 }
    );
  }
}

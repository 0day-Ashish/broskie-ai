import { NextResponse } from "next/server";

const { sql } = require("@/lib/db");

// GET /api/agent/history?userId=1
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Get aggregate stats
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT ar.id) as total_runs,
        COALESCE(SUM(ar.total_applied), 0) as total_applied,
        COALESCE(SUM(ar.total_jobs_scanned), 0) as total_scanned
      FROM agent_runs ar
      ${userId ? sql`WHERE ar.user_id = ${parseInt(userId)}` : sql``}
    `;

    // Get recent results (last 20)
    const results = await sql`
      SELECT 
        res.id,
        res.run_id,
        res.company,
        res.role,
        res.location,
        res.match_score,
        res.match_reason,
        res.status,
        res.created_at,
        runs.query
      FROM agent_results res
      JOIN agent_runs runs ON res.run_id = runs.id
      ${userId ? sql`WHERE res.user_id = ${parseInt(userId)}` : sql``}
      ORDER BY res.created_at DESC
      LIMIT 20
    `;

    // Get top match score
    const topMatch = await sql`
      SELECT match_score, company, role 
      FROM agent_results
      ${userId ? sql`WHERE user_id = ${parseInt(userId)}` : sql``}
      ORDER BY match_score DESC
      LIMIT 1
    `;

    return NextResponse.json({
      stats: stats[0],
      topMatch: topMatch[0] || null,
      results
    });

  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history: " + error.message },
      { status: 500 }
    );
  }
}

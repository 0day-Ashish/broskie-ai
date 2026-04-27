import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";

async function getHR(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const users = await sql`SELECT * FROM users WHERE id = ${decoded.userId} AND role = 'hr'`;
    return users.length > 0 ? users[0] : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const hr = await getHR(request);
  if (!hr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await sql`SELECT * FROM jobs WHERE hr_id = ${hr.id} ORDER BY created_at DESC`;
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const hr = await getHR(request);
  if (!hr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, company, location, type, salary, category, description, requirements, benefits } = await request.json();

    const newJob = await sql`
      INSERT INTO jobs (hr_id, title, company, location, type, salary, category, description, requirements, benefits)
      VALUES (${hr.id}, ${title}, ${company}, ${location}, ${type}, ${salary}, ${category}, ${description}, ${requirements || []}, ${benefits || []})
      RETURNING *
    `;

    return NextResponse.json({ message: "Job created successfully", job: newJob[0] });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

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
  if (!hr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch applications for jobs posted by this HR
    const applications = await sql`
      SELECT ar.*, u.name as applicant_name, u.email as applicant_email, j.title as job_title
      FROM agent_results ar
      JOIN users u ON ar.user_id = u.id
      JOIN jobs j ON ar.job_id = j.id
      WHERE j.hr_id = ${hr.id}
      ORDER BY ar.created_at DESC
    `;
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const hr = await getHR(request);
  if (!hr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { applicationId, status } = await request.json();

    // Verify the application belongs to a job posted by this HR
    const check = await sql`
      SELECT ar.id FROM agent_results ar
      JOIN jobs j ON ar.job_id = j.id
      WHERE ar.id = ${applicationId} AND j.hr_id = ${hr.id}
    `;

    if (check.length === 0) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 });
    }

    const updated = await sql`
      UPDATE agent_results
      SET status = ${status}
      WHERE id = ${applicationId}
      RETURNING *
    `;

    // Create notification if shortlisted
    if (status === 'shortlisted' && updated.length > 0) {
      const app = updated[0];
      const jobs = await sql`SELECT title, company FROM jobs WHERE id = ${app.job_id}`;
      const jobTitle = jobs.length > 0 ? jobs[0].title : 'a job';
      const company = jobs.length > 0 ? jobs[0].company : 'a company';

      await sql`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          ${app.user_id}, 
          'Application Shortlisted!', 
          ${`Congratulations! You have been shortlisted for the ${jobTitle} role at ${company}.`},
          'success'
        )
      `;
    }

    return NextResponse.json({ message: "Status updated", application: updated[0] });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

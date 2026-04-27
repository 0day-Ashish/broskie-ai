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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hr = await getHR(request);
  if (!hr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { title, company, location, type, salary, category, description, requirements, benefits } = await request.json();

    const updatedJob = await sql`
      UPDATE jobs 
      SET title = ${title}, company = ${company}, location = ${location}, type = ${type}, 
          salary = ${salary}, category = ${category}, description = ${description}, 
          requirements = ${requirements}, benefits = ${benefits}
      WHERE id = ${id} AND hr_id = ${hr.id}
      RETURNING *
    `;

    if (updatedJob.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated successfully", job: updatedJob[0] });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hr = await getHR(request);
  if (!hr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await sql`DELETE FROM jobs WHERE id = ${id} AND hr_id = ${hr.id} RETURNING id`;
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}

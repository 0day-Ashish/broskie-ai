import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${user.userId} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { notificationId } = await request.json();

    if (notificationId === 'all') {
      await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ${user.userId}
      `;
    } else {
      await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ${notificationId} AND user_id = ${user.userId}
      `;
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

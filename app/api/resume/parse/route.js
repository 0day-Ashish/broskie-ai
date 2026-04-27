import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text using stable pdf-parse v1.1.1
    const data = await pdf(buffer);
    
    // Clean messy PDF text
    const cleanText = (text) => {
      return text
        .replace(/\n\s*\n/g, "\n") // remove extra gaps
        .replace(/\s+/g, " ")      // normalize spaces
        .trim();
    };

    const resumeText = cleanText(data.text);
    const pagesCount = data.numpages;

    // Use Gemini to extract applicant details
    const { callGeminiJSON } = require("@/lib/ai");

    let applicantDetails = null;

    try {
      applicantDetails = await callGeminiJSON(`Extract the applicant's personal/contact details from this resume. Return ONLY these fields — use null if not found.

RESUME TEXT:
${resumeText.substring(0, 3000)}

Return JSON:
{
  "name": "Full Name exactly as written",
  "email": "email@example.com",
  "phone": "phone number exactly as written",
  "linkedin": "LinkedIn URL if present",
  "portfolio": "portfolio/website URL if present",
  "github": "GitHub URL if present",
  "location": "city, state/country as written",
  "education": "most recent degree and institution"
}`);

      console.log(`📋 Extracted applicant: ${applicantDetails.name}`);
    } catch (err) {
      console.error("Detail extraction failed:", err.message);
      // Fallback — try to grab name from first line
      const firstLine = resumeText.split('\n').find(l => l.trim().length > 0);
      applicantDetails = { name: firstLine?.trim() || "Unknown" };
    }

    return NextResponse.json({
      text: resumeText,
      pages: pagesCount,
      applicant: applicantDetails
    });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF: " + error.message },
      { status: 500 }
    );
  }
}

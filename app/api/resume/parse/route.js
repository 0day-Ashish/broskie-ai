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
    
    // Clean messy PDF text - preserving line breaks for structure
    const cleanText = (text) => {
      return text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")     // normalize horizontal spaces
        .replace(/\n\s*\n/g, "\n\n") // normalize double newlines
        .trim();
    };

    const resumeText = cleanText(data.text);
    const pagesCount = data.numpages;

    // Use Gemini to extract applicant details
    const { callGeminiJSON } = require("@/lib/ai");

    let applicantDetails = null;

    try {
      // We pass the raw-ish text to Gemini so it sees the layout
      applicantDetails = await callGeminiJSON(`You are an expert resume parser. Your ONLY job is to find the applicant's real human name and contact info.

### IDENTITY EXTRACTION RULES:
1. **NAME**: This MUST be a person's name (e.g., "Ashish Ranjan Das"). 
2. **HEART OF THE PROBLEM**: DO NOT ever return "PROFESSIONAL SUMMARY", "SUMMARY", "EXPERIENCE", or any other header as the name.
3. **WHERE TO LOOK**: The name is 99% of the time on the VERY FIRST LINE of the text.
4. **CONFIRMATION**: If the first thing you see is a section header, skip it and look for the actual name.

RESUME TEXT START:
${resumeText.substring(0, 1000)}

FULL RESUME TEXT:
${resumeText.substring(0, 3000)}

Return JSON:
{
  "name": "Human Name Only",
  "email": "email",
  "phone": "phone",
  "linkedin": "url",
  "portfolio": "url",
  "github": "url",
  "location": "City, Country",
  "education": "Degree"
}`);

      // Programmatic Fallback: If AI still fails and returns a header as the name
      const forbiddenNames = ["professional summary", "summary", "experience", "work experience", "objective", "profile"];
      if (!applicantDetails.name || forbiddenNames.includes(applicantDetails.name.toLowerCase().trim())) {
        console.warn("⚠️ AI returned a header as a name. Using fallback extraction...");
        const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        // Usually the first non-empty line that isn't a known header is the name
        const possibleName = lines.find(l => !forbiddenNames.some(f => l.toLowerCase().includes(f)));
        if (possibleName) {
          applicantDetails.name = possibleName;
        }
      }

      console.log(`📋 Extracted applicant: ${applicantDetails.name}`);
    } catch (err) {
      console.error("Detail extraction failed:", err.message);
      // Fallback — try to grab name from first line
      const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      applicantDetails = { name: lines[0] || "Unknown" };
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

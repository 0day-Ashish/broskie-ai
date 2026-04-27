import { NextResponse } from "next/server";

const { sql } = require("@/lib/db");

// GET /api/agent/resume/[id] — downloads tailored resume as PDF
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT tailored_resume, company, role 
      FROM agent_results 
      WHERE id = ${parseInt(id)}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const { tailored_resume, company, role } = result[0];

    if (!tailored_resume) {
      return NextResponse.json({ error: "No tailored resume found" }, { status: 404 });
    }

    // Generate PDF using pdf-lib (works in-memory, no filesystem deps)
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;  // A4
    const pageHeight = 841.89;
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 14;
    const headerHeight = 20;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    };

    // Word-wrap text to fit within maxWidth
    const wrapText = (text, font, size) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth - 20) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const drawText = (text, font, size, indent = 0) => {
      const wrappedLines = wrapText(text, font, size);
      for (const line of wrappedLines) {
        if (y < margin + 20) addNewPage();
        page.drawText(line, {
          x: margin + indent,
          y,
          size,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
      }
    };

    const drawHeader = (text) => {
      y -= 8;
      if (y < margin + 30) addNewPage();
      page.drawText(text.toUpperCase(), {
        x: margin,
        y,
        size: 11,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      y -= 4;
      // Draw underline
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };

    // Parse and render resume
    const lines = tailored_resume.split('\n');
    let isFirstLine = true;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        y -= 6;
        continue;
      }

      // Detect section headers
      const isHeader = /^[A-Z][A-Z\s&\/]+$/.test(trimmed) ||
        ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 
         'contact', 'technical skills', 'work experience', 'professional experience',
         'professional summary', 'core competencies', 'awards', 'interests']
          .some(h => trimmed.toLowerCase() === h || trimmed.toLowerCase().startsWith(h + ':'));

      if (isFirstLine && trimmed.length < 60) {
        // Name — large bold
        page.drawText(trimmed, {
          x: margin,
          y,
          size: 20,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        y -= 26;
        isFirstLine = false;
      } else if (isHeader) {
        isFirstLine = false;
        drawHeader(trimmed);
      } else if (trimmed.startsWith('*') || trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('–')) {
        isFirstLine = false;
        const bulletText = trimmed.replace(/^[\*•\-–]\s*/, '');
        drawText(`• ${bulletText}`, helvetica, 9.5, 10);
      } else if (trimmed.includes('|') && trimmed.length < 120) {
        // Contact info or job title line
        isFirstLine = false;
        drawText(trimmed, helvetica, 9, 0);
      } else {
        isFirstLine = false;
        drawText(trimmed, helvetica, 9.5, 0);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `Resume_${company}_${role}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume PDF: " + error.message },
      { status: 500 }
    );
  }
}

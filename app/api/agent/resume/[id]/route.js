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

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addNewPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    };

    const drawText = (text, font, size, indent = 0, color = rgb(0.15, 0.15, 0.15)) => {
      const words = text.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth - indent) {
          if (y < margin + 20) addNewPage();
          page.drawText(currentLine, {
            x: margin + indent,
            y,
            size,
            font,
            color,
          });
          y -= size + 4;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        if (y < margin + 20) addNewPage();
        page.drawText(currentLine, {
          x: margin + indent,
          y,
          size,
          font,
          color,
        });
        y -= size + 4;
      }
    };

    const drawSectionHeader = (text) => {
      y -= 12;
      if (y < margin + 40) addNewPage();
      
      page.drawText(text.toUpperCase(), {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      y -= 4;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 0.8,
        color: rgb(0.75, 0.75, 0.75),
      });
      y -= 16;
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
      const headers = ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'SUMMARY', 'CERTIFICATIONS', 'TECHNICAL SKILLS', 'WORK EXPERIENCE'];
      const isHeader = (trimmed.length < 40 && (
        trimmed === trimmed.toUpperCase() || 
        headers.some(h => trimmed.toUpperCase().startsWith(h))
      ));

      if (isFirstLine && trimmed.length < 60) {
        // Name — large bold
        page.drawText(trimmed, {
          x: margin,
          y,
          size: 22,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        y -= 25;
        
        // Job Title / Meta
        page.drawText(`${role} | Tailored for ${company}`, {
          x: margin,
          y,
          size: 10,
          font: helvetica,
          color: rgb(0.37, 0.36, 0.9), // Indigo
        });
        y -= 25;
        isFirstLine = false;
      } else if (isHeader) {
        isFirstLine = false;
        drawSectionHeader(trimmed);
      } else if (trimmed.startsWith('*') || trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('–')) {
        isFirstLine = false;
        const bulletText = trimmed.replace(/^[\*•\-–]\s*/, '');
        drawText(`• ${bulletText}`, helvetica, 9.5, 10);
      } else {
        isFirstLine = false;
        drawText(trimmed, helvetica, 9.5, 0);
      }
      y -= 2;
    }

    // Add footer
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
      const footerText = `Broskie.ai - Tailored AI Job Application | Page ${idx + 1}`;
      const footerWidth = helvetica.widthOfTextAtSize(footerText, 8);
      p.drawText(footerText, {
        x: (pageWidth - footerWidth) / 2,
        y: 20,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6)
      });
    });

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

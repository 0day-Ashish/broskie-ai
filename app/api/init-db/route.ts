import { NextResponse } from "next/server";
import { initDB, sql } from "@/lib/db";

const SAMPLE_JOBS = [
  { 
    title: "Senior React Developer", 
    company: "Meta", 
    location: "Remote", 
    type: "Full-time", 
    salary: "$160k - $220k", 
    category: "Engineering",
    description: "We're looking for a Senior React Developer to join our core product team. You will be responsible for building high-performance, scalable web applications that serve billions of users.",
    requirements: ["7+ years of experience with React", "Strong understanding of browser internals", "Experience with large-scale distributed systems"],
    benefits: ["Full health coverage", "Unlimited PTO", "Home office stipend"]
  },
  { 
    title: "Product Designer", 
    company: "Spotify", 
    location: "New York", 
    type: "Hybrid", 
    salary: "$140k - $190k", 
    category: "Design",
    description: "Join the design team at Spotify to redefine how the world listens to music and podcasts. You'll work on cross-functional teams to create intuitive experiences.",
    requirements: ["Strong portfolio showcasing UI/UX work", "Proficiency in Figma", "Experience with user research"],
    benefits: ["Spotify Premium for family", "Wellness grants", "Global parental leave"]
  },
  { 
    title: "Marketing Manager", 
    company: "Netflix", 
    location: "Los Angeles", 
    type: "Full-time", 
    salary: "$130k - $170k", 
    category: "Marketing",
    description: "Launch global marketing campaigns for the world's favorite shows and movies. We're looking for a creative thinker who can manage end-to-end campaign execution.",
    requirements: ["Proven experience in digital marketing", "Excellent storytelling skills", "Data-driven mindset"],
    benefits: ["Complimentary Netflix subscription", "Flexible work schedule", "Generous 401(k) match"]
  },
  { 
    title: "Backend Engineer (Go)", 
    company: "Cloudflare", 
    location: "Remote", 
    type: "Full-time", 
    salary: "$170k - $230k", 
    category: "Engineering",
    description: "Help build the next generation of Cloudflare's edge infrastructure. You'll be working on low-latency systems that handle a massive percentage of all internet traffic.",
    requirements: ["Strong proficiency in Go (Golang)", "Deep understanding of networking protocols", "Passion for security and performance"],
    benefits: ["Remote-first culture", "Professional development budget", "Stock options"]
  },
  { 
    title: "Frontend Developer", 
    company: "Vercel", 
    location: "San Francisco", 
    type: "Full-time", 
    salary: "$150k - $200k", 
    category: "Engineering",
    description: "Define the future of the web at Vercel. Work on Next.js, Turbo, and our deployment platform to empower developers globally.",
    requirements: ["Expert knowledge of TypeScript and React", "Experience with serverless architectures", "Obsession with web performance"],
    benefits: ["Choice of latest Apple hardware", "Annual retreat", "Performance-based bonuses"]
  },
  { 
    title: "Art Director", 
    company: "Adobe", 
    location: "Remote", 
    type: "Full-time", 
    salary: "$120k - $160k", 
    category: "Design",
    description: "Leading creative vision for Adobe's digital presence. You'll be responsible for overseeing high-impact brand campaigns and product visuals.",
    requirements: ["10+ years of creative leadership", "Mastery of Adobe Creative Cloud", "Strong visual storytelling capability"],
    benefits: ["Free Adobe Creative Cloud", "Education reimbursement", "Volunteer time off"]
  },
  { 
    title: "Data Scientist", 
    company: "OpenAI", 
    location: "San Francisco", 
    type: "Full-time", 
    salary: "$200k - $280k", 
    category: "Engineering",
    description: "Apply cutting-edge machine learning research to real-world datasets. Work on fine-tuning models and improving the safety and efficacy of our AI systems.",
    requirements: ["Masters or PhD in CS/Math/Physics", "Expert in Python and PyTorch", "Deep knowledge of NLP and transformers"],
    benefits: ["Help shape the future of AI", "Top-tier compensation", "Commuter benefits"]
  },
  { 
    title: "Social Media Lead", 
    company: "TikTok", 
    location: "London", 
    type: "Hybrid", 
    salary: "£80k - £110k", 
    category: "Marketing",
    description: "Drive the conversation on the world's fastest-growing social platform. You'll be responsible for community engagement and brand voice in the UK market.",
    requirements: ["Expertise in short-form video content", "Ability to react to cultural trends instantly", "Strong analytical skills"],
    benefits: ["Catered lunch", "Modern office in central London", "Global networking opportunities"]
  },
];

export async function GET() {
  try {
    await initDB();

    // Check if jobs already exist
    const jobsCount = await sql`SELECT count(*) FROM jobs`;
    const count = parseInt(jobsCount[0].count);

    if (count === 0) {
      console.log("Seeding jobs table...");
      for (const job of SAMPLE_JOBS) {
        await sql`
          INSERT INTO jobs (title, company, location, type, salary, category, description, requirements, benefits)
          VALUES (${job.title}, ${job.company}, ${job.location}, ${job.type}, ${job.salary}, ${job.category}, ${job.description}, ${job.requirements}, ${job.benefits})
        `;
      }
      return NextResponse.json({ message: "Database initialized and seeded with jobs" });
    }

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("DB init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}

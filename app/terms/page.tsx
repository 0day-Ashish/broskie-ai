"use client";

import { useRouter } from "next/navigation";

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Nav */}
      <nav className="w-full h-16 border-b-[4px] border-black flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-3xl font-bold tracking-tight">broskie</span>
          <span className="text-3xl font-bold tracking-tight text-[#5E5CE6] italic">.ai</span>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="bg-black text-white font-black py-2 px-6 border-[3px] border-black hover:bg-zinc-800 transition-all text-sm uppercase"
        >
          Back to Home
        </button>
      </nav>

      <main className="w-full max-w-4xl px-8 py-16">
        <h1 className="text-7xl font-black tracking-tighter mb-12 italic">Terms of <span className="text-[#5E5CE6]">Service</span></h1>
        
        <div className="space-y-12 text-lg font-bold text-black leading-relaxed">
          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#BEF264]">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">1. Acceptance of Terms</h2>
            <p>By accessing or using Broskie.ai, you agree to be bound by these Terms of Service. If you do not agree, stop using the service immediately. We build cool stuff, you use it fairly, that's the deal.</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">2. Description of Service</h2>
            <p>Broskie.ai provides automated job application tools powered by AI. We help you elevate your job hunt style. We don't guarantee you a job (that's on you and your skills), but we make sure your applications look and feel premium.</p>
          </section>

          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">3. User Responsibilities</h2>
            <p>You are responsible for the accuracy of the information provided in your applications. Don't lie on your resume. Don't spam companies. Be a good broskie.</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">4. Intellectual Property</h2>
            <p>Everything you see on this site — the design, the code, the vibe — is owned by Broskie.ai. Don't steal it. It's built with love and neo-brutalist grit.</p>
          </section>

          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#5E5CE6] text-white">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">5. Limitation of Liability</h2>
            <p>We are not liable for any direct, indirect, or incidental damages arising from your use of the service. Use at your own risk. We're here to help, but we're not magic.</p>
          </section>

          <div className="mt-20 pt-8 border-t-4 border-black">
            <p className="text-zinc-500 font-bold tracking-widest text-sm">Last updated: April 22, 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
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
        <h1 className="text-7xl font-black tracking-tighter mb-12 italic">Privacy <span className="text-[#5E5CE6]">Policy</span></h1>
        
        <div className="space-y-12 text-lg font-bold text-black leading-relaxed">
          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic ">Introduction</h2>
            <p>Your privacy is non-negotiable. At Broskie.ai, we only collect the data we need to make your job applications awesome. We don't sell your data to sketchy third parties. We're broskies, not brokers.</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Email address for account and notifications</li>
              <li>Resume data for application automation</li>
              <li>Usage statistics to improve the vibe</li>
            </ul>
          </section>

          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#BEF264]">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">How We Use Data</h2>
            <p>We use your information strictly to automate your job applications and provide insights on your dashboard. Data is encrypted and stored securely in our Neon database.</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">Cookies</h2>
            <p>We use essential cookies to keep you logged in. No tracking pixels that follow you across the internet. We value your digital personal space.</p>
          </section>

          <section className="p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black text-[#BEF264]">
            <h2 className="text-3xl font-black mb-4 tracking-tight italic">Your Rights</h2>
            <p>You can delete your data at any time. Just hit us up. Once it's gone, it's gone forever from our servers. Absolute control stays with you.</p>
          </section>

          <div className="mt-20 pt-8 border-t-4 border-black">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Last updated: April 22, 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
}

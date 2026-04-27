"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";



export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;

    setSubscribeStatus('loading');
    setSubscribeMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Something went wrong');
        return;
      }

      setSubscribeStatus('success');
      setSubscribeMessage(data.message);
      setSubscribeEmail('');
    } catch (error) {
      setSubscribeStatus('error');
      setSubscribeMessage('Failed to subscribe. Please try again.');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [jobs, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <nav className="w-full h-20 border-b-[4px] border-black flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-3xl font-black tracking-tight">broskie</span>
          <span className="text-3xl font-black tracking-tight text-[#5E5CE6] italic">.ai</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/dashboard")}
            className="hidden md:block font-black uppercase text-sm hover:text-[#5E5CE6] transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => router.push("/")}
            className="bg-black text-white font-black py-3 px-6 border-[3px] border-black hover:bg-zinc-800 transition-all text-sm uppercase active:translate-x-[2px] active:translate-y-[2px]"
          >
            Back to Home
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-16">
          <h1 className="text-8xl font-black tracking-tighter mb-4 italic ">Find Your <span className="text-[#BEF264] text-shadow-brutal">Dream Role</span></h1>
          <p className="text-2xl font-bold text-zinc-500 max-w-2xl">Broskie.ai scans 10,000+ sources daily to find high-fidelity opportunities just for you.</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16 items-start">
          <div className="flex-1 relative group w-full">
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px] border-[4px] border-black"></div>
            <div className="relative border-[4px] border-black bg-white p-2 flex items-center">
              <span className="pl-4 pr-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search jobs, companies, keywords..." 
                className="w-full p-4 font-black text-xl outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            {["All", "Engineering", "Design", "Marketing"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 lg:flex-none border-[4px] border-black py-4 px-8 font-black text-sm uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] ${
                  selectedCategory === cat ? 'bg-[#BEF264]' : 'bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <div key={job.id} className="relative group cursor-pointer" onClick={() => setSelectedJob(job)}>
              <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[4px] border-black group-hover:translate-x-[0px] group-hover:translate-y-[0px] transition-all"></div>
              <div className="relative bg-white border-[4px] border-black p-8 flex flex-col h-full hover:translate-x-[8px] hover:translate-y-[8px] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-[#5E5CE6] text-white px-2 py-1 border-2 border-black font-black text-[10px] uppercase mb-2 inline-block">
                      {job.company}
                    </span>
                    <h2 className="text-3xl font-black tracking-tight mb-2 underline decoration-[#BEF264] decoration-8 underline-offset-[-2px]">
                      {job.title}
                    </h2>
                  </div>
                  <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center hover:bg-[#BEF264] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-bold text-sm tracking-tight">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#BEF264] rounded-full border border-black"></div>
                    <span className="font-bold text-sm tracking-tight">{job.type}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-black italic tracking-tighter">{job.salary}</span>
                  <button className="bg-black text-white font-black py-3 px-8 border-[3px] border-black hover:bg-[#5E5CE6] transition-all text-sm uppercase tracking-tighter active:translate-x-[4px] active:translate-y-[4px]">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-24 border-[4px] border-black border-dashed">
            <h3 className="text-4xl font-black italic uppercase mb-2">No matches found</h3>
            <p className="font-bold text-zinc-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-white pt-32 pb-16 px-8 border-t-[4px] border-black mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
            {/* Branding and Newsletter */}
            <div className="max-w-md">
              <div className="mb-12">
                <h2 className="text-8xl font-black tracking-tighter leading-[0.8] mb-2">Broskie<span className="text-[#5E5CE6] italic">.ai</span></h2>
              </div>
              <div className="mt-16">
                <p className="font-bold mb-4 text-lg">Subscribe to get tips and tactics to grow.</p>
                <div className="relative group max-w-sm">
                  <div className="absolute inset-0 border-[3px] border-black translate-x-[4px] translate-y-[4px]"></div>
                  <form onSubmit={handleSubscribe} className="relative border-[3px] border-black bg-white flex items-center p-1">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="w-full p-3 font-bold outline-none" 
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      required
                    />
                    <button 
                      type="submit"
                      disabled={subscribeStatus === 'loading'}
                      className="bg-[#5E5CE6] text-white w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50"
                    >
                      <span className="text-xl">{subscribeStatus === 'loading' ? '...' : '→'}</span>
                    </button>
                  </form>
                </div>
                {subscribeMessage && (
                  <div className={`mt-4 max-w-sm p-3 border-[3px] border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    subscribeStatus === 'success' ? 'bg-[#BEF264]' : 'bg-red-500 text-white'
                  }`}>
                    {subscribeMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Links Columns */}
            <div className="flex gap-20">
              <div>
                <h4 className="font-black text-lg mb-8">Help</h4>
                <ul className="space-y-4 font-bold text-zinc-600">
                  <li className="hover:text-black cursor-pointer"><a href="/terms">Terms of Service</a></li>
                  <li className="hover:text-black cursor-pointer"><a href="/privacy">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-lg mb-8">More</h4>
                <ul className="space-y-4 font-bold text-zinc-600">
                  <li className="hover:text-black cursor-pointer"><a href="/#features">Features</a></li>
                  <li className="hover:text-black cursor-pointer"><a href="/#pricing">Pricing</a></li>
                  <li className="hover:text-black cursor-pointer"><a href="/jobs">Jobs</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold text-sm">© 2026 Broskie.ai. All rights reserved.</p>
            <div className="flex gap-4">
              {/* Twitter/X */}
              <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center bg-white hover:bg-[#BEF264] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              {/* LinkedIn */}
              <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center bg-white hover:bg-[#BEF264] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454c.98 0 1.775-.773 1.775-1.729V1.729C24 .774 23.205 0 22.225 0z"/>
                </svg>
              </button>
              {/* Instagram */}
              <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center bg-white hover:bg-[#BEF264] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </button>
              {/* GitHub */}
              <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center bg-white hover:bg-[#BEF264] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          ></div>
          
          <div className="relative w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Shadow */}
            <div className="absolute inset-0 bg-black translate-x-[12px] translate-y-[12px] border-[4px] border-black"></div>
            
            {/* Modal Body */}
            <div className="relative bg-white border-[4px] border-black flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-8 border-b-[4px] border-black bg-zinc-50 flex justify-between items-start sticky top-0 z-10">
                <div>
                  <span className="text-sm font-black uppercase tracking-widest text-[#5E5CE6] mb-2 block">{selectedJob.company}</span>
                  <h2 className="text-5xl font-black italic tracking-tighter leading-tight">{selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <span className="bg-[#BEF264] px-4 py-2 border-2 border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       {selectedJob.location}
                    </span>
                    <span className="bg-white px-4 py-2 border-2 border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {selectedJob.salary}
                    </span>
                    <span className="bg-zinc-100 px-4 py-2 border-2 border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{selectedJob.type}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="bg-white border-2 border-black w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white transition-colors active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <span className="text-2xl font-black">✕</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-8 scrollbar-hide">
                <div className="space-y-12 pb-8">
                  <section>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 border-l-8 border-[#BEF264] pl-4">Job Description</h3>
                    <p className="text-xl font-bold text-zinc-700 leading-relaxed italic">{selectedJob.description}</p>
                  </section>

                  <section>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 border-l-8 border-[#5E5CE6] pl-4">Key Requirements</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedJob.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 font-bold text-zinc-600 bg-zinc-50 p-4 border-2 border-black">
                          <span className="w-6 h-6 bg-black text-[#BEF264] flex items-center justify-center font-black text-xs">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 border-l-8 border-black pl-4">Perks & Benefits</h3>
                    <div className="flex flex-wrap gap-4">
                      {selectedJob.benefits.map((benefit: string, i: number) => (
                        <span key={i} className="px-6 py-3 bg-zinc-100 border-2 border-black font-black text-sm uppercase tracking-tight italic">
                          ⚡ {benefit}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t-[4px] border-black bg-white flex flex-col md:flex-row gap-4 sticky bottom-0 z-10 shadow-[0px_-8px_20px_rgba(0,0,0,0.1)]">
                <button 
                  onClick={() => router.push(`/dashboard?job=${selectedJob.id}`)}
                  className="flex-1 bg-black text-white font-black py-4 px-8 border-[3px] border-black hover:bg-zinc-800 transition-all text-xl uppercase italic tracking-tighter active:translate-x-[4px] active:translate-y-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                >
                  Apply with Agent →
                </button>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-[#BEF264] text-black font-black py-4 px-8 border-[3px] border-black hover:bg-[#A9D658] transition-all text-xl uppercase italic tracking-tighter active:translate-x-[4px] active:translate-y-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                >
                  Manual Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

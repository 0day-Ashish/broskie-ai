"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function HRDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Jobs State
  const [jobs, setJobs] = useState<any[]>([]);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    category: "Software Engineering",
    description: "",
    requirements: "",
    benefits: ""
  });

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("broskie_token");
    const role = localStorage.getItem("broskie_user_role");
    const name = localStorage.getItem("broskie_user");

    if (!token || role !== 'hr') {
      router.push("/");
    } else {
      setUserName(name || "HR Manager");
      fetchJobs();
      fetchApplications();
      setIsLoaded(true);
    }
  }, [router]);

  const fetchJobs = async () => {
    const token = localStorage.getItem("broskie_token");
    try {
      const res = await fetch("/api/hr/jobs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem("broskie_token");
    try {
      const res = await fetch("/api/hr/applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplications(data.applications);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("broskie_token");
    const url = editingJob ? `/api/hr/jobs/${editingJob.id}` : "/api/hr/jobs";
    const method = editingJob ? "PUT" : "POST";

    const payload = {
      ...jobForm,
      requirements: jobForm.requirements.split("\n").filter(r => r.trim()),
      benefits: jobForm.benefits.split("\n").filter(b => b.trim())
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddingJob(false);
        setEditingJob(null);
        setJobForm({
          title: "", company: "", location: "", type: "Full-time",
          salary: "", category: "Software Engineering", description: "",
          requirements: "", benefits: ""
        });
        fetchJobs();
      }
    } catch (err) {
      console.error("Failed to save job", err);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const token = localStorage.getItem("broskie_token");
    try {
      const res = await fetch(`/api/hr/jobs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const handleUpdateStatus = async (applicationId: number, status: string) => {
    const token = localStorage.getItem("broskie_token");
    try {
      const res = await fetch("/api/hr/applications", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, status })
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("broskie_token");
    localStorage.removeItem("broskie_user");
    localStorage.removeItem("broskie_user_role");
    router.push("/");
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#5E5CE6] flex items-center justify-center font-black text-white text-4xl">LOADING HR PORTAL...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full h-16 border-b-[4px] border-black flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-3xl font-bold tracking-tight">broskie</span>
          <span className="text-3xl font-bold tracking-tight text-[#5E5CE6] italic">.ai</span>
          <span className="ml-2 bg-black text-[#BEF264] px-2 py-0.5 text-xs font-black uppercase">HR PORTAL</span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="font-black uppercase text-xs hover:text-[#5E5CE6] transition-colors"
          >
            Back to Home
          </Link>
          <span className="font-black text-sm border-2 border-black px-4 py-2 bg-[#BEF264] tracking-tight">
            {userName}
          </span>
          <button onClick={() => setShowLogoutModal(true)} className="bg-black text-white font-black py-2 px-4 border-[3px] border-black hover:bg-zinc-800 transition-all text-sm active:translate-x-[2px] active:translate-y-[2px]">
            Logout
          </button>
        </div>
      </nav>

      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[4px] border-black"></div>
            <div className="relative bg-white border-[4px] border-black p-8 text-center">
              <div className="w-16 h-16 bg-red-500 border-[3px] border-black mx-auto mb-6 flex items-center justify-center rotate-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">Leaving So Soon?</h3>
              <p className="font-bold text-zinc-500 mb-8 italic">Are you sure you want to log out of the HR Portal? Your active recruitment sessions will be paused.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="bg-white text-black font-black py-3 border-[3px] border-black hover:bg-zinc-100 transition-all uppercase text-sm"
                >
                  Stay
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white font-black py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase text-sm"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-7xl px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            
            <p className="text-xl font-bold text-zinc-500 italic">Manage your company's talent pipeline with brutal efficiency.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-8 py-3 font-black border-[3px] border-black transition-all uppercase tracking-tight ${activeTab === 'jobs' ? 'bg-[#BEF264] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100'}`}
            >
              Jobs
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-8 py-3 font-black border-[3px] border-black transition-all uppercase tracking-tight ${activeTab === 'applications' ? 'bg-[#BEF264] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-zinc-100'}`}
            >
              Applications
            </button>
          </div>
        </div>

        {activeTab === 'jobs' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase italic">Active Job Postings</h2>
              <button 
                onClick={() => { setIsAddingJob(true); setEditingJob(null); }}
                className="bg-[#5E5CE6] text-white font-black py-3 px-8 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase italic"
              >
                + Post New Job
              </button>
            </div>

            {isAddingJob || editingJob ? (
              <div className="bg-zinc-50 border-[4px] border-black p-8 relative">
                <button 
                  onClick={() => { setIsAddingJob(false); setEditingJob(null); }}
                  className="absolute top-4 right-4 text-2xl font-black"
                >✕</button>
                <h3 className="text-2xl font-black mb-8 uppercase italic underline underline-offset-8">
                  {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                </h3>
                <form onSubmit={handleJobSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Job Title</label>
                      <input 
                        required
                        className="w-full border-[3px] border-black p-3 font-bold"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Company</label>
                      <input 
                        required
                        className="w-full border-[3px] border-black p-3 font-bold"
                        value={jobForm.company}
                        onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Location</label>
                        <input 
                          required
                          className="w-full border-[3px] border-black p-3 font-bold"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                          placeholder="Remote / City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Job Type</label>
                        <select 
                          className="w-full border-[3px] border-black p-3 font-bold"
                          value={jobForm.type}
                          onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                        >
                          <option>Full-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Salary Range</label>
                        <input 
                          required
                          className="w-full border-[3px] border-black p-3 font-bold"
                          value={jobForm.salary}
                          onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                          placeholder="e.g. ₹15L - ₹25L"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Category</label>
                        <input 
                          required
                          className="w-full border-[3px] border-black p-3 font-bold"
                          value={jobForm.category}
                          onChange={(e) => setJobForm({...jobForm, category: e.target.value})}
                          placeholder="Engineering / Design"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Description</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full border-[3px] border-black p-3 font-bold"
                        value={jobForm.description}
                        onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                        placeholder="Detailed job description..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Requirements (one per line)</label>
                      <textarea 
                        rows={3}
                        className="w-full border-[3px] border-black p-3 font-bold"
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                        placeholder="React / Next.js&#10;5+ years experience"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Benefits (one per line)</label>
                      <textarea 
                        rows={2}
                        className="w-full border-[3px] border-black p-3 font-bold"
                        value={jobForm.benefits}
                        onChange={(e) => setJobForm({...jobForm, benefits: e.target.value})}
                        placeholder="Health Insurance&#10;Unlimited PTO"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAddingJob(false); setEditingJob(null); }}
                      className="px-8 py-3 font-black border-[3px] border-black uppercase tracking-tight hover:bg-zinc-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#BEF264] px-12 py-3 font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase tracking-tight transition-all"
                    >
                      {editingJob ? "Update Job" : "Publish Job"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6">
              {jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} className="border-[4px] border-black p-6 bg-white hover:bg-zinc-50 transition-all relative group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-[#5E5CE6] text-white px-2 py-0.5 border-2 border-black font-black text-[10px] uppercase italic">{job.category}</span>
                        <span className="bg-zinc-100 text-black px-2 py-0.5 border-2 border-black font-black text-[10px] uppercase italic">{job.type}</span>
                      </div>
                      <h3 className="text-3xl font-black italic tracking-tighter">{job.title}</h3>
                      <p className="font-bold text-zinc-500 italic uppercase text-sm tracking-widest">{job.company} • {job.location} • {job.salary}</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setEditingJob(job);
                          setJobForm({
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            type: job.type,
                            salary: job.salary,
                            category: job.category,
                            description: job.description,
                            requirements: job.requirements.join("\n"),
                            benefits: job.benefits.join("\n")
                          });
                        }}
                        className="bg-white px-5 py-2 border-[3px] border-black font-black uppercase text-xs hover:bg-[#BEF264] transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-white px-5 py-2 border-[3px] border-black font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="border-[4px] border-black border-dashed p-20 text-center bg-zinc-50">
                  <p className="text-2xl font-black italic text-zinc-300">NO JOBS POSTED YET. START RECRUITING NOW.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase italic">Received Applications</h2>
            <div className="space-y-6">
              {applications.length > 0 ? applications.map(app => (
                <div key={app.id} className="border-[4px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#BEF264] text-black px-3 py-1 border-2 border-black font-black text-xs uppercase italic">Applied for: {app.job_title}</span>
                        <span className={`px-3 py-1 border-2 border-black font-black text-xs uppercase italic ${
                          app.status === 'applied' ? 'bg-zinc-100' : 
                          app.status === 'shortlisted' ? 'bg-[#5E5CE6] text-white' : 
                          app.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-[#BEF264]'
                        }`}>{app.status}</span>
                      </div>
                      <h3 className="text-4xl font-black italic tracking-tighter mb-2">{app.applicant_name}</h3>
                      <p className="font-black text-zinc-400 mb-6 italic flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {app.applicant_email}
                      </p>
                      
                      <div className="bg-zinc-50 border-[3px] border-black p-4 mb-6">
                        <h4 className="text-xs font-black uppercase mb-2 italic text-[#5E5CE6]">Match Reason:</h4>
                        <p className="font-bold text-sm italic">"{app.match_reason}"</p>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/resume/generate-pdf', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  text: app.tailored_resume,
                                  name: app.applicant_name,
                                  jobTitle: app.job_title
                                })
                              });
                              
                              if (res.ok) {
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                              } else {
                                alert("Failed to generate PDF");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Error generating PDF preview");
                            }
                          }}
                          className="bg-black text-white px-6 py-2 border-[3px] border-black font-black uppercase text-xs hover:bg-[#5E5CE6] transition-all italic"
                        >
                          View Tailored Resume
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-[3px] border-black p-8 bg-zinc-50 min-w-[200px]">
                      <span className="text-6xl font-black italic text-[#5E5CE6]">{app.match_score}%</span>
                      <span className="font-black uppercase text-[10px] tracking-widest mt-2">Match Score</span>
                      
                      <div className="w-full h-[2px] bg-black my-6"></div>
                      
                      <div className="flex flex-col w-full gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                          disabled={app.status === 'shortlisted'}
                          className={`w-full py-2 border-[2px] border-black font-black text-xs uppercase transition-all ${
                            app.status === 'shortlisted' 
                              ? 'bg-zinc-200 opacity-50 cursor-not-allowed' 
                              : 'bg-[#BEF264] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]'
                          }`}
                        >
                          {app.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          className="w-full bg-white py-2 border-[2px] border-black font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="border-[4px] border-black border-dashed p-20 text-center bg-zinc-50">
                  <p className="text-2xl font-black italic text-zinc-300">NO APPLICATIONS RECEIVED YET.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

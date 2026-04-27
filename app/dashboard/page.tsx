"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [jobCount, setJobCount] = useState(25);
  const [minMatchScore, setMinMatchScore] = useState(80);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Agent state
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentResults, setAgentResults] = useState<any>(null);
  const [agentError, setAgentError] = useState("");
  const [agentStep, setAgentStep] = useState("");

  // Persistent history from DB
  const [userId, setUserId] = useState("");
  const [history, setHistory] = useState<any>(null);
  const [applicantDetails, setApplicantDetails] = useState<any>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus("loading");
    setSubscribeMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus("success");
        setSubscribeMessage("Welcome to the inner circle! Check your inbox.");
        setSubscribeEmail("");
      } else {
        setSubscribeStatus("error");
        setSubscribeMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setSubscribeStatus("error");
      setSubscribeMessage("Failed to connect. Please try again.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadStatus('error');
      setUploadMessage("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage("File size must be under 10MB.");
      return;
    }

    setUploadStatus('loading');
    setSelectedFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Extract clean text from PDF
      const parseRes = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData
      });

      if (parseRes.ok) {
        const parseData = await parseRes.json();
        setResumeText(parseData.text);
        setApplicantDetails(parseData.applicant);
        console.log(`📄 Extracted ${parseData.text.length} chars from ${parseData.pages} page(s)`);
        if (parseData.applicant?.name) {
          console.log(`👤 Applicant: ${parseData.applicant.name}`);
        }
      } else {
        console.warn("PDF parse failed, using filename as fallback");
        setResumeText(`Resume: ${file.name}`);
      }

      // Step 2: Also upload to DB for storage
      const token = localStorage.getItem("broskie_token");
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadForm
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus('success');
        setUploadMessage(applicantDetails?.name ? `✓ ${applicantDetails.name}'s resume ready` : "Resume parsed & uploaded.");
      } else {
        setUploadStatus('error');
        setUploadMessage(data.error || "Upload failed.");
      }
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage("Connection error. Try again.");
    }
  };

  const handleRunAgent = async () => {
    if (!agentPrompt.trim()) {
      setAgentError("Please enter a job query first.");
      return;
    }

    const finalResume = resumeText || `Job seeker looking for: ${agentPrompt}. Skills: JavaScript, Python, React, Node.js, Machine Learning, Data Analysis.`;

    setAgentRunning(true);
    setAgentResults(null);
    setAgentError("");
    setAgentStep("Scanning job database...");

    try {
      // Simulate step progression for UX
      setTimeout(() => setAgentStep("Matching jobs with Gemini AI..."), 2000);
      setTimeout(() => setAgentStep("Tailoring resumes..."), 5000);
      setTimeout(() => setAgentStep("Submitting applications..."), 8000);

      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: agentPrompt + (location ? ` in ${location}` : ""),
          resumeText: finalResume,
          userId: userId || undefined,
          applicant: applicantDetails || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAgentError(data.error || "Agent failed.");
      } else {
        setAgentResults(data);
        // Refresh history after successful run
        fetchHistory();
      }
    } catch (err) {
      setAgentError("Failed to connect to agent. Try again.");
    } finally {
      setAgentRunning(false);
      setAgentStep("");
    }
  };

  const fetchHistory = async (uid?: string) => {
    try {
      const id = uid || userId;
      const res = await fetch(`/api/agent/history${id ? `?userId=${id}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchNotifications = async (uid?: string) => {
    try {
      const token = localStorage.getItem("broskie_token");
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markNotificationAsRead = async (id: string | 'all') => {
    try {
      const token = localStorage.getItem("broskie_token");
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    const id = userId;
    if (id) {
      fetchNotifications();
    }
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("broskie_token");
    const name = localStorage.getItem("broskie_user");
    const uid = localStorage.getItem("broskie_user_id") || "";

    if (!token) {
      router.push("/");
    } else {
      setUserName(name || "User");
      setUserId(uid);
      fetchHistory(uid);
      const isNewLogin = searchParams.get("new_login") === "true";
      
      if (isNewLogin) {
        setTimeout(() => {
          setIsLoaded(true);
        }, 1000);
      } else {
        setIsLoaded(true);
      }
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (!isLoaded) return;

    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoaded]);

  const handleLogout = () => {
    localStorage.removeItem("broskie_token");
    localStorage.removeItem("broskie_user");
    router.push("/");
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#5E5CE6] flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Shadow */}
        <div className="absolute inset-0 bg-black translate-x-[10px] translate-y-[10px] border-[4px] border-black"></div>
        
        {/* Main Card */}
        <div className="relative bg-white border-[4px] border-black p-12 flex flex-col items-center gap-8 max-w-sm w-full animate-in fade-in zoom-in duration-300">
          {/* Animated Star */}
          <div className="w-20 h-20 animate-spin-slow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.81 8.62L22 9.24L16.5 14L18.18 21L12 17.27L5.82 21L7.5 14L2 9.24L9.19 8.62L12 2Z" fill="#BEF264" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black italic tracking-tighter mb-1">Authenticating</h2>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold tracking-tight">broskie</span>
              <span className="text-2xl font-bold tracking-tight text-[#5E5CE6] italic">.ai</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-4 bg-zinc-100 border-[3px] border-black overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-[#BEF264] animate-progress-ind"></div>
          </div>

          <p className="font-black text-[10px] tracking-[0.2em] text-zinc-400 animate-pulse">
            Connecting to secure neural network...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progress-ind {
          0% { left: -40%; width: 40%; }
          50% { left: 40%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-progress-ind {
          animation: progress-ind 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Dashboard Nav */}
      <nav className="w-full h-16 border-b-[4px] border-black flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-3xl font-bold tracking-tight">broskie</span>
          <span className="text-3xl font-bold tracking-tight text-[#5E5CE6] italic">.ai</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-white border-[3px] border-black p-2 hover:bg-[#BEF264] transition-all active:translate-x-[2px] active:translate-y-[2px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full mt-4 right-0 w-80 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="p-4 border-b-[3px] border-black flex justify-between items-center bg-zinc-50">
                  <h3 className="font-black uppercase text-xs tracking-widest italic">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markNotificationAsRead('all')}
                      className="text-[10px] font-black uppercase underline hover:text-[#5E5CE6]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markNotificationAsRead(n.id)}
                        className={`p-4 border-b-[2px] border-black last:border-0 hover:bg-zinc-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-[#BEF264]/10' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 border border-black ${n.type === 'success' ? 'bg-[#BEF264]' : 'bg-[#5E5CE6]'}`}></span>
                          <h4 className="font-black text-xs uppercase">{n.title}</h4>
                          <span className="text-[10px] font-bold text-zinc-400 ml-auto">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs font-black uppercase text-zinc-300 italic">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showNotifications && (
              <div className="fixed inset-0 z-[90]" onClick={() => setShowNotifications(false)}></div>
            )}
          </div>

          <span className="font-black text-sm border-2 border-black px-4 py-2 bg-[#BEF264] tracking-tight">
            {userName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-black text-white font-black py-2 px-4 border-[3px] border-black hover:bg-zinc-800 transition-all text-sm active:translate-x-[2px] active:translate-y-[2px]"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="w-full max-w-7xl px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-4">Welcome back, {userName.split(" ")[0]}!</h1>
            <p className="text-xl font-bold text-zinc-500">Your job hunt automation is running at full speed.</p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-white text-black font-black py-3 px-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all tracking-tight uppercase text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Agent Control Center */}
        <div className="mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[4px] border-black"></div>
            <div className="relative bg-white border-[4px] border-black p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end">
                {/* Primary Input */}
                <div className="flex-1 w-full">
                  <label className="block text-sm font-black uppercase tracking-widest mb-3 italic">What jobs should I apply to?</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder="e.g., ML internships in Bangalore or Frontend remote roles"
                      className="w-full bg-zinc-50 border-[3px] border-black p-5 text-2xl font-black placeholder:text-zinc-300 outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="w-full lg:w-72">
                  <label className="block text-sm font-black uppercase tracking-widest mb-3 italic">Resume Source</label>
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  <label 
                    htmlFor="resume-upload"
                    className={`border-[3px] border-black border-dashed p-5 text-center cursor-pointer hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center min-h-[78px] ${
                      uploadStatus === 'loading' ? 'animate-pulse opacity-50 cursor-wait' : 
                      uploadStatus === 'success' ? 'bg-[#BEF264]' : 
                      uploadStatus === 'error' ? 'bg-red-200' : ''
                    }`}
                  >
                    <span className="font-black text-sm uppercase truncate max-w-full px-2">
                      {uploadStatus === 'loading' ? 'Encrypting...' : 
                       selectedFileName || 'Upload Resume'}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 ${uploadStatus === 'error' ? 'text-red-700' : 'text-zinc-400 font-black'}`}>
                      {uploadStatus === 'error' ? uploadMessage : 
                       uploadStatus === 'success' ? 'READY IN DB' : 'PDF ONLY (<10MB)'}
                    </span>
                  </label>
                </div>

                {/* Start Button */}
                <div className="w-full lg:w-fit">
                  <button
                    onClick={handleRunAgent}
                    disabled={agentRunning}
                    className={`w-full lg:w-fit font-black py-5 px-10 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] transition-all text-xl uppercase italic whitespace-nowrap disabled:opacity-50 disabled:cursor-wait ${agentRunning ? 'bg-zinc-600 text-white animate-pulse' : 'bg-[#5E5CE6] text-white'}`}
                  >
                    {agentRunning ? agentStep || 'Running...' : 'Start Agent →'}
                  </button>
                </div>
              </div>

              {/* Advanced Toggle */}
              <div className="mt-8">
                <button 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex items-center gap-2 font-black text-sm uppercase tracking-widest group"
                >
                  <span className={`transition-transform duration-200 ${isAdvancedOpen ? 'rotate-90' : ''}`}>▶</span>
                  <span className="group-hover:underline underline-offset-4">Advanced Filters</span>
                </button>

                {isAdvancedOpen && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t-2 border-black border-dashed animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">Location Preference</label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Remote, Global, or City"
                        className="w-full border-2 border-black p-3 font-bold text-sm outline-none bg-zinc-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">No. of Jobs ({jobCount})</label>
                      <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        step="5"
                        value={jobCount}
                        onChange={(e) => setJobCount(parseInt(e.target.value))}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">Min. Match Score ({minMatchScore}%)</label>
                      <input 
                        type="range" 
                        min="50" 
                        max="95" 
                        step="5"
                        value={minMatchScore}
                        onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                        className="w-full accent-[#5E5CE6] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Error */}
        {agentError && (
          <div className="mb-8 bg-red-100 border-[4px] border-red-500 p-6 font-black text-red-700 flex items-center justify-between">
            <span>{agentError}</span>
            <button onClick={() => setAgentError('')} className="text-2xl hover:opacity-60">✕</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#BEF264] p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="block text-lg font-black tracking-tight mb-2">Total Applications</span>
            <span className="text-7xl font-black tracking-tighter italic">
              {agentResults ? agentResults.totalApplied : (history?.stats?.total_applied || '0')}
            </span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-black opacity-60">
                {agentResults ? `${agentResults.totalJobsScanned} jobs scanned` : `${history?.stats?.total_runs || 0} agent runs`}
              </span>
            </div>
          </div>

          <div className="bg-[#5E5CE6] p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
            <span className="block text-lg font-black tracking-tight mb-2">Top Match</span>
            <span className="text-7xl font-black tracking-tighter italic">
              {agentResults?.results?.[0]?.matchScore || history?.topMatch?.match_score || '—'}%
            </span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-black opacity-80 italic">
                {agentResults?.results?.[0]
                  ? `${agentResults.results[0].company} — ${agentResults.results[0].role}`
                  : history?.topMatch
                    ? `${history.topMatch.company} — ${history.topMatch.role}`
                    : 'Run agent to see'}
              </span>
            </div>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="block text-lg font-black tracking-tight mb-2">Total Runs</span>
            <span className="text-7xl font-black tracking-tighter italic text-[#5E5CE6]">{history?.stats?.total_runs || '0'}</span>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-black opacity-60">
                {history?.stats?.total_scanned ? `${history.stats.total_scanned} jobs scanned total` : 'No runs yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Results */}
        {agentResults && (
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-8 tracking-tighter italic">Agent Results</h2>
            <div className="space-y-6">
              {agentResults.results.map((result: any, i: number) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px] border-[3px] border-black group-hover:translate-x-[0px] group-hover:translate-y-[0px] transition-all"></div>
                  <div className="relative bg-white border-[3px] border-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:translate-x-[6px] hover:translate-y-[6px] transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#5E5CE6] text-white px-2 py-1 border-2 border-black font-black text-[10px] uppercase">{result.company}</span>
                        <span className={`px-2 py-1 border-2 border-black font-black text-[10px] uppercase ${result.status === 'applied' ? 'bg-[#BEF264]' : 'bg-red-200'}`}>{result.status}</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{result.role}</h3>
                      <p className="text-sm font-bold text-zinc-500 mt-1">{result.location} • {result.matchReason}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="block text-4xl font-black text-[#5E5CE6] italic">{result.matchScore}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Match</span>
                      </div>
                      {result.resultId && (
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `/api/agent/resume/${result.resultId}`;
                            link.download = `Resume_${result.company}_${result.role}.pdf`;
                            link.click();
                          }}
                          className="bg-[#BEF264] text-black font-black py-2 px-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs uppercase tracking-tight whitespace-nowrap"
                        >
                          ↓ Resume
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Idle State — show when no results yet */}
        {!agentResults && !agentRunning && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="border-[4px] border-black p-8 brutal-shadow">
              <h2 className="text-3xl font-black mb-8 tracking-tighter">How It Works</h2>
              <div className="space-y-6">
                {[
                  { step: "01", msg: "Enter your job search query above", detail: "Be specific — 'ML internships in Bangalore' works better than 'jobs'" },
                  { step: "02", msg: "Upload your resume (optional)", detail: "We'll use it to match and tailor for each role" },
                  { step: "03", msg: "Click 'Start Agent'", detail: "Gemini AI matches, tailors, and applies automatically" },
                  { step: "04", msg: "Review your results", detail: "See match scores, companies, and application statuses" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 border-b-2 border-black pb-4 last:border-0 last:pb-0">
                    <span className="bg-black text-[#BEF264] w-10 h-10 flex items-center justify-center font-black text-sm shrink-0">{item.step}</span>
                    <div>
                      <p className="font-black text-lg">{item.msg}</p>
                      <p className="text-sm font-bold text-zinc-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-[10px] translate-y-[10px] border-[4px] border-black"></div>
              <div className="relative bg-[#BEF264] border-[4px] border-black p-8 h-full flex flex-col">
                <h2 className="text-3xl font-black mb-4 tracking-tighter italic">AI Agent</h2>
                <p className="text-lg font-bold mb-8 italic">"I'm ready to scan your database, match jobs with Gemini AI, tailor your resume, and auto-apply. Just type your query and hit Start."</p>
                <div className="mt-auto flex gap-4 flex-wrap">
                  {['ML Intern', 'Frontend Remote', 'Data Scientist'].map(tag => (
                    <button key={tag} onClick={() => setAgentPrompt(tag)} className="bg-black text-white font-black py-2 px-4 border-[3px] border-black hover:bg-zinc-800 transition-all tracking-tighter text-sm active:translate-x-[2px] active:translate-y-[2px]">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Running State */}
        {agentRunning && (
          <div className="border-[4px] border-black p-12 bg-zinc-50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-6 animate-spin">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.81 8.62L22 9.24L16.5 14L18.18 21L12 17.27L5.82 21L7.5 14L2 9.24L9.19 8.62L12 2Z" fill="#BEF264" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-2 italic">{agentStep}</h3>
            <p className="font-bold text-zinc-400">This may take 15-30 seconds. Gemini is working hard.</p>
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-white pt-32 pb-16 px-8 border-t-[4px] border-black mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
            {/* Branding and Newsletter */}
            <div className="max-w-md">
              <div className="mb-12">
                <h2 className="text-8xl font-black tracking-tighter leading-[0.8] mb-2">Broskie<span className="text-[#5E5CE6] italic">.ai</span></h2>
              </div>
              <div className="mt-16">
                <p className="font-bold mb-4">Subscribe to get tips and tactics to grow.</p>
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

          <div className="w-full h-[2px] bg-black mb-12"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="font-bold text-zinc-500 text-sm">© 2026 Broskie AI Inc. All rights reserved.</p>
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
    </div>
  );
}

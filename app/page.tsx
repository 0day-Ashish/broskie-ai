"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  // Function to handle testimonial scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 450;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'hr-login' | 'hr-signup'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Contact Form State
  const [issueName, setIssueName] = useState('');
  const [issueEmail, setIssueEmail] = useState('');
  const [issueSubject, setIssueSubject] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [issueStatus, setIssueStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [issueResult, setIssueResult] = useState('');

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('broskie_token');
    const storedName = localStorage.getItem('broskie_user');
    if (token && storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint = authMode.includes('login') ? '/api/auth/login' : '/api/auth/signup';
      const role = authMode.includes('hr') ? 'hr' : 'user';
      const body = authMode.includes('login')
        ? { email, password, requiredRole: role }
        : { email, password, name, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Something went wrong');
        return;
      }

      // Store token and user info
      localStorage.setItem('broskie_token', data.token);
      localStorage.setItem('broskie_user', data.user.name || data.user.email);
      localStorage.setItem('broskie_user_id', String(data.user.id));
      localStorage.setItem('broskie_user_role', data.user.role || 'user');
      setIsLoggedIn(true);
      setUserName(data.user.name || data.user.email);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      setName('');

      // Redirect to dashboard after successful login/signup
      if (data.user.role === 'hr') {
        router.push("/hr/dashboard?new_login=true");
      } else {
        router.push("/dashboard?new_login=true");
      }
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('broskie_token');
    localStorage.removeItem('broskie_user');
    localStorage.removeItem('broskie_user_role');
    setIsLoggedIn(false);
    setUserName('');
  };

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

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueName || !issueEmail || !issueMessage) return;

    setIssueStatus('loading');
    setIssueResult('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: issueName,
          email: issueEmail,
          subject: issueSubject,
          message: issueMessage
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIssueStatus('error');
        setIssueResult(data.error || 'Something went wrong');
        return;
      }

      setIssueStatus('success');
      setIssueResult(data.message);
      // Clear form
      setIssueName('');
      setIssueEmail('');
      setIssueSubject('');
      setIssueMessage('');
    } catch (error) {
      setIssueStatus('error');
      setIssueResult('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#5E5CE6]/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white border-[4px] border-black p-8 w-full max-w-md brutal-shadow-lg animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => { setShowLoginModal(false); setAuthError(''); }}
              className="absolute top-4 right-4 w-10 h-10 border-2 border-black flex items-center justify-center bg-[#BEF264] hover:bg-white transition-all font-black text-black"
            >
              ✕
            </button>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-black">
              {authMode.includes('login') ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="font-bold text-zinc-500 mb-8 uppercase text-sm tracking-widest">
              {authMode.includes('login') ? 'Enter your credentials' : 'Create your account'}
              {authMode.includes('hr') && <span className="text-[#5E5CE6] ml-2">(HR Portal)</span>}
            </p>

            {authError && (
              <div className="bg-red-100 border-[3px] border-red-500 p-3 mb-6 font-bold text-red-700 text-sm">
                {authError}
              </div>
            )}

            <form className="space-y-6" onSubmit={(e) => {
              // Set role based on authMode before calling handleAuth
              const role = authMode.includes('hr') ? 'hr' : 'user';
              // We need to pass the role or use it in handleAuth. 
              // Since handleAuth is already defined, let's modify it to use a role parameter or check authMode.
              handleAuth(e);
            }}>
              {authMode.includes('signup') && (
                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-black">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors text-black placeholder:text-zinc-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-black uppercase mb-2 text-black">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors text-black placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-2 text-black">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors text-black placeholder:text-zinc-400 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 border-2 border-black flex items-center justify-center bg-[#BEF264] hover:bg-white transition-all brutal-shadow-sm active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <div className="relative group w-full">
                  <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px]"></div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="relative w-full bg-[#BEF264] text-black font-black py-4 border-[4px] border-black active:translate-x-[6px] active:translate-y-[6px] transition-all uppercase tracking-tighter text-xl disabled:opacity-50"
                  >
                    {authLoading ? 'Please wait...' : authMode.includes('login') ? 'Log In →' : 'Sign Up →'}
                  </button>
                </div>
              </div>

              <p className="text-center font-bold text-sm mt-8 text-black space-y-2 flex flex-col">
                {authMode === 'login' ? (
                  <>
                    <span>Don&apos;t have an account? <span className="underline cursor-pointer hover:text-[#5E5CE6]" onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Sign up now</span></span>
                    <span className="text-xs opacity-60">or</span>
                    <span className="underline cursor-pointer hover:text-[#5E5CE6] text-xs" onClick={() => { setAuthMode('hr-login'); setAuthError(''); }}>Are you an HR? Login here</span>
                  </>
                ) : authMode === 'signup' ? (
                  <>
                    <span>Already have an account? <span className="underline cursor-pointer hover:text-[#5E5CE6]" onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log in</span></span>
                  </>
                ) : authMode === 'hr-login' ? (
                  <>
                    <span>Don&apos;t have an HR account? <span className="underline cursor-pointer hover:text-[#5E5CE6]" onClick={() => { setAuthMode('hr-signup'); setAuthError(''); }}>Register as HR</span></span>
                    <span className="text-xs opacity-60">or</span>
                    <span className="underline cursor-pointer hover:text-[#5E5CE6] text-xs" onClick={() => { setAuthMode('login'); setAuthError(''); }}>User Login</span>
                  </>
                ) : (
                  <>
                    <span>Already have an HR account? <span className="underline cursor-pointer hover:text-[#5E5CE6]" onClick={() => { setAuthMode('hr-login'); setAuthError(''); }}>HR Log in</span></span>
                  </>
                )}
              </p>
            </form>
          </div>
        </div>
      )}
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b-4 border-black fixed top-0 left-0 w-full bg-white z-50">
        <div className="leading-none font-bold">
          <span className="text-3xl font-bold tracking-tight">broskie</span>
          <span className="text-3xl font-bold tracking-tight text-[#5E5CE6] italic">.ai</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {[
            { name: "Home", href: "/" },
            { name: "Jobs", href: "/jobs" },
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "Contact", href: "#contact" }
          ].map((item) => (
            <a key={item.name} href={item.href} className="font-bold uppercase tracking-wider text-sm hover:text-[#5E5CE6] transition-colors">
              {item.name}
            </a>
          ))}
        </div>

        {isLoggedIn ? (
          <div className="relative mr-16">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="group flex items-center gap-2 bg-[#BEF264] text-black font-black py-2 px-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#a6d84b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm uppercase"
            >
              <span className="max-w-[120px] truncate">{userName}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 font-black text-sm uppercase hover:bg-[#BEF264] transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}

            {/* Click outside to close */}
            {showUserDropdown && (
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setShowUserDropdown(false)}
              ></div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-[#5E5CE6] text-white font-black py-2 px-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#4d4acb] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-base -rotate-1 mr-16"
          >
            LogIn/SignUp
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative bg-[#5E5CE6] h-[650px] border-b-4 border-black pt-30 mt-18">
        {/* Top decorative asterisk */}
        <div className="absolute right-[36%] top-[-12%] w-100 h-100 rotate-180 opacity-90 pointer-events-none">
          <Image src="/assets/image(3).webp" alt="top asterisk" width={96} height={96} className="w-full h-full object-contain" />
        </div>
        {/* Scattered Stars */}
        <div className="absolute left-[7%] top-[10%] w-7 h-7 opacity-100 pointer-events-none">
          <Image src="/assets/image(2).webp" alt="small star" width={40} height={40} />
        </div>
        <div className="absolute right-[15%] top-[15%] w-8 h-8 opacity-100 pointer-events-none">
          <Image src="/assets/image(2).webp" alt="small star" width={40} height={40} />
        </div>
        <div className="absolute right-[25%] bottom-[30%] w-10 h-10 opacity-100 pointer-events-none">
          <Image src="/assets/image(2).webp" alt="small star" width={40} height={40} />
        </div>
        <div className="absolute left-[25%] bottom-[40%] w-9 h-9 opacity-100 pointer-events-none">
          <Image src="/assets/image(2).webp" alt="small star" width={40} height={40} />
        </div>

        {/* Left border large asterisk */}
        <div className="absolute left-[-73px] top-[50%] translate-y-[-50%] w-[300px] h-[300px] opacity-100 pointer-events-none">
          <div className="animate-float w-full h-full">
            <Image src="/assets/image(1).webp" alt="asterisk" width={300} height={300} className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="absolute right-[-50px] top-[24%] translate-y-[-50%] w-[200px] h-[200px] opacity-100 rotate-180 animate-float pointer-events-none">
          <Image src="/assets/image(1).webp" alt="asterisk" width={300} height={300} className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-[-65px] left-1/2 translate-x-[-50%] w-[500px] h-auto pointer-events-none">
          <Image src="/assets/image(6).png" alt="center graphic" width={500} height={300} className="w-full h-auto object-contain object-bottom" />
        </div>
        <div className="absolute bottom-[-55px] left-[5%] w-[180px] h-auto pointer-events-none">
          <Image src="/assets/image(7).png" alt="left graphic" width={180} height={120} className="w-full h-auto object-contain object-bottom" />
        </div>
        <div className="absolute bottom-[-20px] right-[5%] w-[200px] h-auto pointer-events-none">
          <Image src="/assets/image(8).png" alt="right graphic" width={200} height={140} className="w-full h-auto object-contain object-bottom" />
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-2">
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter text-shadow-brutal">
              Layoff Season?
            </h1>
            <div className="relative">
              {/* Static Shadow */}
              <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[3px] border-black rotate-2"></div>
              {/* Moving Button */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    router.push("/dashboard");
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="relative bg-[#BEF264] text-black font-bold py-2 px-6 border-[3px] border-black flex items-center gap-2 text-lg active:translate-x-[8px] active:translate-y-[8px] transition-all rotate-2"
              >
                Get Started
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-[3] stroke-current">
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="square" />
                </svg>
              </button>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter text-shadow-brutal">
            Elevate Your Job Hunt Style
          </h1>
        </div>
      </main>

      {/* Trusted By Section */}
      <section className="bg-white pt-48 pb-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 reveal">
          <div className="max-w-xl">
            <h2 className="text-6xl font-black mb-6 tracking-tight leading-[0.9]">
              Trusted By Industry <br /> Leaders
            </h2>
            <p className="text-zinc-500 text-2xl font-medium leading-relaxed max-w-lg">
              We deliver real results for our clients. That&apos;s why we are proud to be trusted by leading companies in the industry.
            </p>
          </div>

          <div className="flex border-[3px] border-black divide-x-[3px] divide-black overflow-hidden brutal-shadow">
            <div className="px-12 py-10 bg-white">
              <span className="block text-lg font-black tracking-tight mb-4">Jobs Applied</span>
              <span className="text-6xl font-normal text-[#5E5CE6] tracking-tight">20k+</span>
            </div>
            <div className="px-12 py-10 bg-white">
              <span className="block text-lg font-black tracking-tight mb-4">Satisfaction Rate</span>
              <span className="text-6xl font-normal text-[#5E5CE6] tracking-tight">95%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="bg-white pb-32 reveal">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 border-y-2 border-black border-collapse">
          {/* Box 1: What We Do? */}
          <div className="bg-[#BEF264] py-2 px-10 flex flex-col justify-center border-2 border-black">
            <h2 className="text-5xl font-black mb-2 tracking-tighter leading-none">What We Do?</h2>
            <p className="text-lg font-bold flex items-center gap-2">
              I&apos;m glad you asked. Please Follow the arrows <span className="text-2xl">↓ ↘︎ →</span>
            </p>
          </div>

          {/* Box 2: CMS Integration */}
          <div className="bg-[#5E5CE6] py-12 px-10 text-white border-2 border-black">
            <h3 className="text-3xl font-black mb-3 tracking-tight">ATS Friendly Resume Tailorization</h3>
            <p className="text-xl font-medium opacity-95 leading-relaxed max-w-md italic">
              Our AI surgically adapts your resume for every single job, hitting hidden keywords and bypassing ATS filters with 99% accuracy.
            </p>
          </div>

          {/* Box 3: Web Development */}
          <div className="bg-[#5E5CE6] py-12 px-10 text-white relative overflow-hidden border-2 border-black">
            <h3 className="text-4xl font-black mb-3 tracking-tighter">Job Hunting</h3>
            <p className="text-xl font-medium opacity-95 leading-relaxed max-w-md italic">
              Stop manual scrolling. Broskie scans thousands of sources to pinpoint roles that actually match your skills and salary expectations.
            </p>
            {/* Decorative Image 4 */}
            <div className="absolute right-[-1%] top-[-1%] w-38 h-38 pointer-events-none ">
              <Image src="/assets/image(4).webp" alt="decorative" width={200} height={200} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Box 4: SEO & Speed Optimization */}
          <div className="bg-[#BEF264] py-12 px-10 border-2 border-black">
            <div className="flex flex-col h-full">
              <h3 className="text-3xl font-black mb-3 tracking-tight">Agent Execution</h3>
              <p className="text-xl font-bold leading-relaxed max-w-md italic">
                Set your parameters and let the agent work. From bulk applying to auto-follow-ups, we handle the heavy lifting while you sleep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Developer Section */}
      <section className="bg-white py-32 px-8 reveal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 relative group">
            {/* The photo frame */}
            <div className="absolute inset-0 bg-black translate-x-[12px] translate-y-[12px] border-[4px] border-black"></div>
            <div className="relative border-[4px] border-black bg-[#BEF264] p-4 flex items-center justify-center overflow-hidden">
              <div className="aspect-square w-full relative overflow-hidden border-[4px] border-black bg-white group-hover:scale-[1.02] transition-transform duration-500">
                <Image src="/assets/image(9).png" alt="Developer" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-[#5E5CE6] mb-4">The Brains Behind</h2>
            <h2 className="text-7xl font-black mb-8 tracking-tighter leading-none">Meet the <br /> Developer</h2>
            <p className="text-2xl font-medium leading-relaxed mb-10 text-zinc-700">
              Passionate about building fast, accessible, and <span className="font-black italic bg-[#BEF264] px-2 border-2 border-black">visually striking</span> web experiences. I specialize in turning complex ideas into simple, high-performance interfaces that convert.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              {['Next.js', 'Typescript', 'Tailwind', 'UX Design', '3D UI'].map((skill) => (
                <span key={skill} className="px-4 py-2 border-2 border-black font-black text-sm uppercase tracking-tight bg-zinc-50 hover:bg-black hover:text-white transition-colors">
                  {skill}
                </span>
              ))}
            </div>

            <div className="relative inline-block">
              <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px]"></div>
              <button
                onClick={() => window.open('https://arddev.in', '_blank')}
                className="relative bg-[#BEF264] text-black font-black py-4 px-10 border-[4px] border-black active:translate-x-[6px] active:translate-y-[6px] transition-all uppercase tracking-tighter text-xl flex items-center gap-4 group"
              >
                Hire the Brain <span className="group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Customer Stories Section */}
      <section className="bg-[#5E5CE6] py-32 px-8 reveal">
        <div className="max-w-7xl mx-auto text-center mb-20 text-white">
          <h2 className="text-6xl font-black mb-6 tracking-tighter text-shadow-brutal">Customer Stories</h2>
          <p className="text-xl font-medium opacity-90">
            See how our platform has transformed businesses across industries
          </p>
        </div>

        <div ref={scrollRef} className="max-w-7xl mx-auto flex overflow-x-auto pb-12 px-12 gap-12 snap-x snap-mandatory scrollbar-hide scroll-smooth">
          {/* Testimonials */}
          {[
            { name: "Aryan Sharma", role: "Frontend Developer", text: "Broskie.ai literally saved my sanity. I applied to 50 jobs in one afternoon while I was at the gym. Got 3 interviews by the next morning!" },
            { name: "Priya Patel", role: "UX Researcher", text: "The resume tailoring is spooky good. It caught keywords I didn't even know existed for my role. 10/10 would automate again." },
            { name: "John Smith", role: "DevOps Engineer", text: "I was skeptical about 'bulk applying', but the smart filters are legitimate. It only picked roles that actually matched my stack." },
            { name: "Sarah Jenkins", role: "Sr. Data Scientist", text: "Finally, a tool that doesn't just spam my resume. The 'Human-in-the-loop' controls gave me the confidence I needed." },
            { name: "Michael Chen", role: "Product Manager", text: "The Interview Booster generated questions that were almost identical to what my recruiter asked. It's like a cheat code." },
            { name: "Ananya Iyer", role: "Growth Lead", text: "Used the Pro plan for a week and secured a role at a top-tier startup. The auto follow-ups are the absolute killer feature." }
          ].map((testimonial, index) => (
            <div key={index} className="flex-shrink-0 w-[400px] bg-white p-10 border-[4px] border-black relative brutal-shadow snap-start">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-16 h-16">
                  {/* Decorative Yellow Star/Asterisk Shape */}
                  <div className="absolute inset-0 bg-[#BEF264] rotate-12 scale-110"></div>
                  <div className="relative bg-zinc-200 w-full h-full border-2 border-black overflow-hidden">
                    <Image src="/assets/image(7).png" alt={testimonial.name} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-xl leading-tight">{testimonial.name}</h4>
                  <p className="text-sm text-zinc-500 font-bold">{testimonial.role}</p>
                </div>
              </div>

              <div className="w-full h-[2px] bg-black mb-8 opacity-20"></div>

              <p className="text-xl font-medium leading-relaxed italic text-zinc-800">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Decorative Quotes Icon */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#BEF264] border-[3px] border-black flex items-center justify-center rotate-6">
                <span className="text-4xl font-black text-black leading-none mt-2">,,</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px]"></div>
            <button
              onClick={() => handleScroll('left')}
              className="relative bg-[#BEF264] border-[3px] border-black w-14 h-14 flex items-center justify-center active:translate-x-[6px] active:translate-y-[6px] transition-all"
            >
              <span className="text-2xl font-black">←</span>
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px]"></div>
            <button
              onClick={() => handleScroll('right')}
              className="relative bg-[#BEF264] border-[3px] border-black w-14 h-14 flex items-center justify-center active:translate-x-[6px] active:translate-y-[6px] transition-all"
            >
              <span className="text-2xl font-black">→</span>
            </button>
          </div>
        </div>
      </section>
      <section id="pricing" className="bg-white py-32 px-8 reveal">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-7xl font-black mb-6 tracking-tighter italic">Broskie <span className="text-[#5E5CE6]">Plans</span></h2>
          <p className="text-2xl font-bold text-zinc-500 max-w-2xl mx-auto">
            Choose the path to your next dream role. Start for free, upgrade to dominate.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Free Plan */}
          <div className="relative group">
            <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[4px] border-black"></div>
            <div className="relative bg-white border-[4px] border-black p-8 h-full flex flex-col">
              <div className="mb-8">
                <span className="bg-zinc-100 px-4 py-1 border-2 border-black font-black text-xs uppercase tracking-widest mb-4 inline-block">The Starter</span>
                <h3 className="text-4xl font-black mb-2">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black italic">₹0</span>
                  <span className="text-zinc-500 font-bold">/forever</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BEF264] border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">✓</span>
                  </div>
                  <p className="font-bold">Apply to 3–5 jobs/day</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BEF264] border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">✓</span>
                  </div>
                  <p className="font-bold">Basic job search</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BEF264] border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">✓</span>
                  </div>
                  <p className="font-bold">Resume tailoring (limited)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BEF264] border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">✓</span>
                  </div>
                  <p className="font-bold">Standard match scoring</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BEF264] border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">✓</span>
                  </div>
                  <p className="font-bold">Tracking dashboard</p>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black">×</span>
                  </div>
                  <p className="font-bold line-through">Auto Follow-Ups</p>
                </div>
              </div>

            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative group">
            <div className="absolute inset-0 bg-black translate-x-[8px] translate-y-[8px] border-[4px] border-black"></div>
            <div className="relative bg-[#BEF264] border-[4px] border-black p-8 h-full flex flex-col">
              <div className="mb-8">
                <span className="bg-black text-white px-4 py-1 border-2 border-black font-black text-xs uppercase tracking-widest mb-4 inline-block">Best Value</span>
                <h3 className="text-4xl font-black mb-2">Pro Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black italic">₹499</span>
                  <span className="text-black/60 font-bold">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black text-white">✓</span>
                  </div>
                  <p className="font-black italic">Intelligent Bulk Apply (20-50 jobs)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black text-white">✓</span>
                  </div>
                  <p className="font-bold">Deep Resume Tailoring (ATS-Focused)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black text-white">✓</span>
                  </div>
                  <p className="font-bold">Priority Parallel Automation</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black text-white">✓</span>
                  </div>
                  <p className="font-bold">Auto Follow-Ups & Tracking</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <span className="text-[14px] font-black text-white">✓</span>
                  </div>
                  <p className="font-bold">Human-in-the-loop Controls</p>
                </div>

                {/* Differentiator */}
                <div className="mt-6 pt-6 border-t-2 border-black/20 bg-white/30 p-4 border-dashed border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💎</span>
                    <h4 className="text-xl font-black italic tracking-tighter">Interview Booster</h4>
                  </div>
                  <p className="text-sm font-bold opacity-90">Likely questions + personalized answers generated per application.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-[4px] translate-y-[4px]"></div>
                <button className="relative w-full bg-black text-white font-black py-5 border-[3px] border-black active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase tracking-widest text-lg">
                  Go Pro Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="bg-[#5E5CE6] py-32 px-8 reveal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          {/* Left Column: Get In Touch */}
          <div className="w-full md:w-1/3">
            <h2 className="text-6xl font-black text-white mb-6">Drop Your Issues</h2>
            <p className="text-white text-xl font-medium opacity-90 mb-26">
              Ready to transform your business? Get in touch and let&apos;s make it happen!
            </p>

            <h3 className="text-4xl font-black text-white mb-10">Get In Touch</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#BEF264] border-[3px] border-black flex items-center justify-center shrink-0">
                  <span className="text-xl">✉</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-white/60">EMAIL US:</p>
                  <p className="text-lg font-bold text-white">arif@retroui.dev</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#BEF264] border-[3px] border-black flex items-center justify-center shrink-0">
                  <span className="text-xl">📞</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-white/60">CALL US:</p>
                  <p className="text-lg font-bold text-white">+1 (234) 567-8900</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#BEF264] border-[3px] border-black flex items-center justify-center shrink-0">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-white/60">VISIT US:</p>
                  <p className="text-lg font-bold text-white leading-tight">123 Innovation Street<br />Tech District, CA 90210</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full md:w-2/3 relative pt-44">
            {/* Header Image 5 */}
            <div className="absolute -top-10 right-0 w-[400px] h-auto hidden lg:block pointer-events-none">
              <Image src="/assets/image(5).webp" alt="connect illustration" width={450} height={350} className="w-full h-auto object-contain" />
            </div>

            <h3 className="text-4xl font-black text-white mb-10 text-right max-w-xl ml-auto">Submit Here</h3>
            <form onSubmit={handleIssueSubmit} className="space-y-6 max-w-xl ml-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={issueName}
                  onChange={(e) => setIssueName(e.target.value)}
                  className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email *"
                  value={issueEmail}
                  onChange={(e) => setIssueEmail(e.target.value)}
                  className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={issueSubject}
                onChange={(e) => setIssueSubject(e.target.value)}
                className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors"
              />
              <textarea
                placeholder="How can we help you? *"
                value={issueMessage}
                onChange={(e) => setIssueMessage(e.target.value)}
                rows={4}
                className="w-full bg-white border-[3px] border-black py-2 px-4 font-bold outline-none transition-colors resize-none"
                required
              ></textarea>

              <div className="flex flex-col items-end gap-4 overflow-hidden">
                {issueResult && (
                  <div className={`w-full p-3 border-[3px] border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${issueStatus === 'success' ? 'bg-[#BEF264]' : 'bg-red-500 text-white'
                    }`}>
                    {issueResult}
                  </div>
                )}

                <div className="relative w-fit">
                  <div className="absolute inset-0 bg-black translate-x-[4px] translate-y-[4px]"></div>
                  <button
                    type="submit"
                    disabled={issueStatus === 'loading'}
                    className="relative bg-[#BEF264] text-black font-black py-2 px-6 border-[3px] border-black active:translate-x-[4px] active:translate-y-[4px] transition-all text-lg disabled:opacity-50"
                  >
                    {issueStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white pt-32 pb-16 px-8 reveal">
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
                  <div className={`mt-4 max-w-sm p-3 border-[3px] border-black font-black text-xs uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${subscribeStatus === 'success' ? 'bg-[#BEF264]' : 'bg-red-500 text-white'
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
                  <li className="hover:text-black cursor-pointer"><a href="#features">Features</a></li>
                  <li className="hover:text-black cursor-pointer"><a href="#pricing">Pricing</a></li>
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
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* LinkedIn */}
              <button className="w-10 h-10 border-[3px] border-black flex items-center justify-center bg-white hover:bg-[#BEF264] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454c.98 0 1.775-.773 1.775-1.729V1.729C24 .774 23.205 0 22.225 0z" />
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
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Prompt Notification */}
      {showNotification && !isLoggedIn && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className="relative group">
            {/* Shadow */}
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px] border-[3px] border-black"></div>

            {/* Box Content */}
            <div className="relative bg-white border-[3px] border-black p-6 pr-12 max-w-xs shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.1)]">
              {/* Close Button */}
              <button
                onClick={() => setShowNotification(false)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white transition-colors active:translate-x-[2px] active:translate-y-[2px]"
              >
                <span className="font-black">✕</span>
              </button>

              <div className="flex flex-col">
                <p className="font-black italic text-sm leading-tight">Ready to dominate?</p>
                <p className="font-bold text-xs opacity-90 mt-1">Login or Signup to access your automation dashboard.</p>
              </div>

              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-4 w-full bg-black text-white font-black py-2 border-2 border-black hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest active:translate-x-[2px] active:translate-y-[2px]"
              >
                Join Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

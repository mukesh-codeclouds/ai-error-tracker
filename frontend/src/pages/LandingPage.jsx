import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '⚡', title: 'Instant Parsing', desc: 'Regex-based parsers process megabytes in milliseconds — no AI latency.' },
  { icon: '🐘', title: 'PHP Support',    desc: 'Laravel, WordPress, and raw PHP error logs — Fatal, Warning, Notice, Stack traces.' },
  { icon: '⬢',  title: 'Node.js Support', desc: 'Express, PM2, and raw stderr — UnhandledPromise, TypeError, ReferenceError.' },
  { icon: '🐍', title: 'Python Support',  desc: 'Django, Flask, and script logs — multi-line Traceback blocks parsed correctly.' },
  { icon: '🔍', title: 'Auto-Detection',  desc: 'Scoring-based format detection from first 50 lines with manual override.' },
  { icon: '📦', title: '.gz Support',     desc: 'Gzip-compressed logs decompressed server-side via Node.js zlib streams.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-900 text-white overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L6 7L9 10L12 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="4" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight">
            Track<span className="gradient-text">Error</span>
          </span>
        </div>
        <Link to="/upload" id="landing-cta-nav" className="btn-primary">
          Start Analysing →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/15 border border-brand-500/25 text-brand-300 text-xs font-medium mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Phase 1 — Deterministic Parsing Engine
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
          Find errors in your
          <br />
          <span className="gradient-text">log files instantly</span>
        </h1>

        <p className="max-w-xl text-lg text-slate-400 leading-relaxed mb-10 animate-slide-up">
          Upload PHP, Node.js, or Python log files and get a structured,
          severity-ranked error report in seconds. No AI required — pure regex speed.
        </p>

        <div className="flex items-center gap-4 animate-slide-up">
          <Link to="/upload" id="landing-cta-hero" className="btn-primary text-base px-7 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v10M4 4l4-3 4 3M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload Logs Free
          </Link>
          <a href="#features" className="btn-secondary text-base px-7 py-3">
            See Features
          </a>
        </div>

        {/* Supported formats */}
        <div className="flex items-center gap-6 mt-12 animate-fade-in">
          {[
            { label: 'PHP',     color: 'text-violet-400', icon: '🐘' },
            { label: 'Node.js', color: 'text-green-400',  icon: '⬢' },
            { label: 'Python',  color: 'text-yellow-400', icon: '🐍' },
          ].map(({ label, color, icon }) => (
            <div key={label} className="flex items-center gap-1.5 text-sm">
              <span>{icon}</span>
              <span className={`font-semibold ${color}`}>{label}</span>
            </div>
          ))}
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-600">.gz supported</span>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12 text-slate-200">
          Everything you need in Phase 1
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card p-6 hover:border-brand-500/20 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                {icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/upload" id="landing-cta-bottom" className="btn-primary text-base px-8 py-3">
            Get Started — Upload Your First Log →
          </Link>
        </div>
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import useSessionStore from '../../store/useSessionStore'

export default function Navbar() {
  const { uploadStatus, clearSession } = useSessionStore()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-surface-800/80 backdrop-blur-sm shrink-0">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 13L6 7L9 10L12 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="4" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-sm text-white tracking-tight">
          Track<span className="gradient-text">Error</span>
        </span>
      </Link>

      {/* Status pill */}
      <div className="flex items-center gap-3">
        {uploadStatus === 'uploading' && (
          <span className="flex items-center gap-1.5 text-xs text-brand-300 animate-pulse-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Uploading…
          </span>
        )}
        {uploadStatus === 'parsing' && (
          <span className="flex items-center gap-1.5 text-xs text-yellow-300 animate-pulse-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Parsing…
          </span>
        )}
        {uploadStatus === 'done' && (
          <button
            id="clear-session-btn"
            onClick={clearSession}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors duration-150 underline underline-offset-2"
          >
            Clear session
          </button>
        )}
        <Link
          to="/upload"
          id="nav-upload-btn"
          className="btn-primary text-xs px-3 py-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v10M4 4l4-3 4 3M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload Logs
        </Link>
      </div>
    </header>
  )
}

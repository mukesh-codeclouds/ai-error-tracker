import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/upload',
    label: 'Upload & Analyse',
    id: 'sidebar-upload',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v10M4 4l4-3 4 3M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/5 bg-surface-800 py-4 px-3 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 13L6 7L9 10L12 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="4" r="1.5" fill="white"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none">TrackError</p>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Phase 1</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            id={item.id}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3">
        <div className="rounded-xl bg-brand-600/10 border border-brand-500/20 p-3">
          <p className="text-xs font-semibold text-brand-300 mb-0.5">Phase 1</p>
          <p className="text-[11px] text-slate-500 leading-snug">
            Regex-based parsing — PHP · Node.js · Python
          </p>
        </div>
      </div>
    </aside>
  )
}

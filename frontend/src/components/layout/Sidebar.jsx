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
  {
    to: '/settings',
    label: 'AI Settings',
    id: 'sidebar-settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M12.9 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4"/>
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


    </aside>
  )
}

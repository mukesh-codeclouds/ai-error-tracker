import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center text-center px-6">
      <p className="text-8xl font-extrabold gradient-text mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">← Back to Home</Link>
    </div>
  )
}

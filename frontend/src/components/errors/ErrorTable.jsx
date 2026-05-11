import { useState } from 'react'
import FormatBadge from '../parser/FormatBadge'

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const SEVERITY_CLASSES = {
  critical: 'severity-critical',
  high:     'severity-high',
  medium:   'severity-medium',
  low:      'severity-low',
}

const SEVERITY_DOT = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-green-500',
}

function ErrorRow({ error, index }) {
  const [expanded, setExpanded] = useState(false)
  const sc = SEVERITY_CLASSES[error.severity] || 'severity-low'

  return (
    <>
      <tr
        id={`error-row-${error.id}`}
        className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors duration-100"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* # */}
        <td className="px-4 py-3 text-xs text-slate-600 font-mono">{index + 1}</td>

        {/* Severity */}
        <td className="px-4 py-3">
          <span className={`badge ${sc} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[error.severity]}`} />
            {error.severity}
          </span>
        </td>

        {/* Type */}
        <td className="px-4 py-3">
          <span className="text-xs font-mono text-slate-300">{error.errorType}</span>
        </td>

        {/* Format */}
        <td className="px-4 py-3">
          <FormatBadge format={error.language} />
        </td>

        {/* Message */}
        <td className="px-4 py-3 max-w-md">
          <p className="text-xs text-slate-300 truncate font-mono">{error.message}</p>
        </td>

        {/* File:line */}
        <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
          {error.file ? (
            <span title={error.file}>
              …{error.file.split('/').slice(-2).join('/')}
              {error.line ? `:${error.line}` : ''}
            </span>
          ) : '—'}
        </td>

        {/* Timestamp */}
        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
          {error.timestamp
            ? new Date(error.timestamp).toLocaleTimeString()
            : '—'}
        </td>

        {/* Expand toggle */}
        <td className="px-4 py-3 text-slate-600">
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </td>
      </tr>

      {/* Expanded raw line */}
      {expanded && (
        <tr className="bg-surface-700/50">
          <td colSpan={8} className="px-6 py-3">
            <div className="rounded-lg bg-surface-900 border border-white/5 p-3">
              <p className="text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-widest">Raw Log Line</p>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {error.rawLine || error.message}
              </pre>
              {error.stackFrames?.length > 0 && (
                <div className="mt-3 border-t border-white/5 pt-3">
                  <p className="text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-widest">Stack Trace</p>
                  {error.stackFrames.map((frame, i) => (
                    <p key={i} className="text-xs font-mono text-slate-400 leading-relaxed">
                      {frame}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ErrorTable({ fileResult }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { errors = [], summary = {}, fileName, detectedFormat, overrideApplied, parseTimeMs } = fileResult

  const filtered = errors
    .filter((e) => filter === 'all' || e.severity === filter)
    .filter((e) =>
      !search ||
      e.message?.toLowerCase().includes(search.toLowerCase()) ||
      e.errorType?.toLowerCase().includes(search.toLowerCase()) ||
      e.file?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4))

  const FILTERS = ['all', 'critical', 'high', 'medium', 'low']

  return (
    <div id={`error-table-${fileName}`} className="card overflow-hidden animate-slide-up">
      {/* File header */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate font-mono">{fileName}</p>
            <FormatBadge format={detectedFormat} />
            {overrideApplied && (
              <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30">overridden</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Parsed in {parseTimeMs}ms · {errors.length} errors found
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'critical', label: 'Critical', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
            { key: 'high',     label: 'High',     cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
            { key: 'medium',   label: 'Medium',   cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
            { key: 'low',      label: 'Low',      cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
          ].map(({ key, label, cls }) =>
            summary[key] > 0 ? (
              <span key={key} className={`badge border ${cls}`}>
                {summary[key]} {label}
              </span>
            ) : null,
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/5 bg-surface-700/30">
        {/* Severity filter tabs */}
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-150 ${
                filter === f
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {f} {f !== 'all' && summary[f] ? `(${summary[f]})` : ''}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          id="error-search-input"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search errors…"
          className="input py-1.5 text-xs ml-auto max-w-[220px]"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-600 text-sm">
          No errors match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-600 uppercase tracking-widest border-b border-white/5">
                {['#', 'Severity', 'Type', 'Format', 'Message', 'File:Line', 'Time', ''].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((error, i) => (
                <ErrorRow key={error.id} error={error} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

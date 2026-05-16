import { useState, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import FormatBadge from '../parser/FormatBadge'
import useCodebaseStore from '../../store/useCodebaseStore'
import { matchLogPathToLocal } from '../../utils/pathMatcher'
import CodeViewerModal from '../viewer/CodeViewerModal'
import { getAISuggestion } from '../../services/ai'
import useAIStore from '../../store/useAIStore'
import FixSuggestion from '../ai/FixSuggestion'
import { Sparkles, Loader2, X, AlertCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

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

// ── Collapsed row ────────────────────────────────────────────────────────────
function ErrorRow({ error, index, virtualRow, isSelected, onSelect }) {
  const sc = SEVERITY_CLASSES[error.severity] || 'severity-low'

  return (
    <tr
      id={`error-row-${error.id}`}
      ref={virtualRow.measureElement}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }}
      className={`border-b border-white/5 cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-brand-600/10' : 'hover:bg-white/[0.02]'
      }`}
      onClick={() => onSelect(error)}
    >
      <td className="px-4 py-3 text-xs text-slate-600 font-mono whitespace-nowrap">{index + 1}</td>

      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`badge ${sc} border`}>
          <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[error.severity]}`} />
          {error.severity}
        </span>
      </td>

      <td className="px-4 py-3 whitespace-nowrap max-w-[160px]">
        <span className="text-xs font-mono text-slate-300 block truncate">
          {(error.errorType || '').replace(/\n/g, ' ')}
        </span>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <FormatBadge format={error.language} />
      </td>

      <td className="px-4 py-3 max-w-md">
        <p className="text-xs text-slate-300 truncate font-mono">{error.message}</p>
      </td>

      <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
        {error.file ? (
          <span title={error.file}>
            …{error.file.split('/').slice(-2).join('/')}
            {error.line ? `:${error.line}` : ''}
          </span>
        ) : '—'}
      </td>

      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
        {error.timestamp ? new Date(error.timestamp).toLocaleTimeString() : '—'}
      </td>

      <td className="px-4 py-3 text-slate-600">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </td>
    </tr>
  )
}

// ── Error Detail Modal ───────────────────────────────────────────────────────
function ErrorDetailModal({ error, onClose, onViewCode }) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const aiConfig = useAIStore()
  const { fileIndex, status: codebaseStatus, directoryHandle } = useCodebaseStore()
  const localPath = codebaseStatus === 'connected' ? matchLogPathToLocal(error.file, fileIndex) : null
  const sc = SEVERITY_CLASSES[error.severity] || 'severity-low'

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleGetAIFix = async () => {
    if (aiLoading) return
    setAiLoading(true)
    try {
      let codeContext = ''
      if (localPath && directoryHandle) {
        const { getFileHandleByPath, readFileContent } = await import('../../utils/fileSystem')
        const handle = await getFileHandleByPath(directoryHandle, localPath)
        if (handle) codeContext = await readFileContent(handle)
      }
      const result = await getAISuggestion({
        message: error.message,
        errorType: error.errorType,
        file: error.file,
        line: error.line,
        codeContext,
        language: error.language,
        stackTrace: error.stackFrames?.join('\n'),
      }, aiConfig)
      setAiSuggestion(result)
    } catch (err) {
      console.error('AI Fix Error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal card — stop click propagation so backdrop click closes, content click doesn't */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{ backgroundColor: 'var(--color-surface-800, #1a1f2e)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 border-b border-white/10"
          style={{ backgroundColor: 'var(--color-surface-800, #1a1f2e)' }}
        >
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <AlertCircle size={16} className="text-slate-400 shrink-0" />
              <span className={`badge ${sc} border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[error.severity]}`} />
                {error.severity}
              </span>
              <span className="text-sm font-semibold text-white font-mono">
                {(error.errorType || '').replace(/\n/g, ' ')}
              </span>
            </div>
            {error.file && (
              <p className="text-xs font-mono text-slate-500 truncate" title={error.file}>
                {error.file}{error.line ? `:${error.line}` : ''}
              </p>
            )}
            {error.timestamp && (
              <p className="text-xs text-slate-600">
                {new Date(error.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGetAIFix}
              disabled={aiLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                aiLoading
                  ? 'text-blue-400 border-blue-500/30 bg-blue-500/10 animate-pulse'
                  : 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              AI Fix
            </button>
            {localPath && (
              <button
                onClick={() => { onViewCode(localPath, error.line, error.language); onClose() }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                View Code
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Message */}
          <div className="rounded-xl bg-black/20 border border-white/5 p-4">
            <p className="text-[11px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Message</p>
            <p className="text-sm text-slate-200 font-mono leading-relaxed break-all">{error.message}</p>
          </div>

          {/* AI suggestion */}
          {(aiLoading || aiSuggestion) && (
            <div>
              {aiLoading ? (
                <div className="rounded-xl border border-dashed border-blue-500/20 p-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="text-blue-500 animate-spin" />
                  <p className="text-sm font-bold text-white">AI is analyzing the error...</p>
                  <p className="text-xs text-slate-500">Comparing log context with your local codebase.</p>
                </div>
              ) : (
                <FixSuggestion suggestion={aiSuggestion} />
              )}
            </div>
          )}

          {/* Raw log + stack trace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl bg-black/20 border border-white/5 p-4">
              <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                Raw Log Entry
              </p>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {error.rawLine || error.message}
              </pre>
            </div>

            {error.stackFrames?.length > 0 && (
              <div className="rounded-xl bg-black/20 border border-white/5 p-4">
                <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  Stack Trace
                </p>
                <div className="space-y-1.5">
                  {error.stackFrames.map((frame, i) => (
                    <p key={i} className="text-[11px] font-mono text-slate-400 leading-relaxed border-l-2 border-white/5 pl-3 hover:border-blue-500/50 transition-colors">
                      {frame}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Main table ───────────────────────────────────────────────────────────────
export default function ErrorTable({ fileResult }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedError, setSelectedError] = useState(null)
  const [viewer, setViewer] = useState({ isOpen: false, filePath: '', line: null, lang: '' })
  const parentRef = useRef()

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

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
    paddingStart: 42, // offset rows below sticky thead
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const FILTERS = ['all', 'critical', 'high', 'medium', 'low']

  // Shift+wheel → horizontal scroll
  const handleWheel = (e) => {
    if (e.shiftKey && parentRef.current) {
      e.preventDefault()
      parentRef.current.scrollLeft += e.deltaY
    }
  }

  const handleSelectRow = (error) => {
    setSelectedError((prev) => (prev?.id === error.id ? null : error))
  }

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
            Parsed in {parseTimeMs}ms · {errors.length} logs found
          </p>
        </div>

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

        <input
          id="error-search-input"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search errors…"
          className="input py-1.5 text-xs ml-auto max-w-[220px]"
        />
      </div>

      {/* Virtualised table — shift+wheel scrolls horizontally */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-600 text-sm">
          No errors match your filters.
        </div>
      ) : (
        <div
          ref={parentRef}
          onWheel={handleWheel}
          className="overflow-auto max-h-[500px] relative scrollbar-thin scrollbar-thumb-white/10"
        >
          <table className="w-full text-left min-w-[800px]" style={{ height: `${totalSize}px`, position: 'relative' }}>
            <thead className="sticky top-0 bg-surface-800 z-10">
              <tr className="text-[11px] text-slate-600 uppercase tracking-widest border-b border-white/5">
                {['#', 'Severity', 'Type', 'Format', 'Message', 'File:Line', 'Time', ''].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {virtualRows.map((virtualRow) => {
                const error = filtered[virtualRow.index]
                return (
                  <ErrorRow
                    key={error.id}
                    error={error}
                    index={virtualRow.index}
                    virtualRow={virtualRow}
                    isSelected={selectedError?.id === error.id}
                    onSelect={handleSelectRow}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Error detail modal — rendered into document.body via portal */}
      {selectedError && (
        <ErrorDetailModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
          onViewCode={(path, line, lang) => setViewer({ isOpen: true, filePath: path, line, lang })}
        />
      )}

      {/* Code Viewer Modal */}
      <CodeViewerModal
        isOpen={viewer.isOpen}
        onClose={() => setViewer({ ...viewer, isOpen: false })}
        filePath={viewer.filePath}
        highlightLine={viewer.line}
        language={viewer.lang}
      />
    </div>
  )
}

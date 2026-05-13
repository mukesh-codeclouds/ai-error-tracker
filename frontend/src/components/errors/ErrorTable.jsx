import { useState } from 'react'
import FormatBadge from '../parser/FormatBadge'
import useCodebaseStore from '../../store/useCodebaseStore'
import { matchLogPathToLocal } from '../../utils/pathMatcher'
import CodeViewerModal from '../viewer/CodeViewerModal'
import { getAISuggestion } from '../../services/ai'
import useAIStore from '../../store/useAIStore'
import FixSuggestion from '../ai/FixSuggestion'
import { Sparkles, Loader2 } from 'lucide-react'

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

function ErrorRow({ error, index, onViewCode }) {
  const [expanded, setExpanded] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const sc = SEVERITY_CLASSES[error.severity] || 'severity-low'

  const { fileIndex, status: codebaseStatus, directoryHandle } = useCodebaseStore()
  const aiConfig = useAIStore()
  const localPath = codebaseStatus === 'connected' ? matchLogPathToLocal(error.file, fileIndex) : null

  const handleGetAIFix = async (e) => {
    e.stopPropagation()
    if (aiLoading) return
    
    setAiLoading(true)
    setExpanded(true) // Expand to show loading/results
    
    try {
      let codeContext = ''
      if (localPath && directoryHandle) {
        const { getFileHandleByPath, readFileContent } = await import('../../utils/fileSystem')
        const handle = await getFileHandleByPath(directoryHandle, localPath)
        if (handle) {
          codeContext = await readFileContent(handle)
        }
      }

      const result = await getAISuggestion({
        message: error.message,
        errorType: error.errorType,
        file: error.file,
        line: error.line,
        codeContext,
        language: error.language,
        stackTrace: error.stackFrames?.join('\n')
      }, aiConfig)
      
      setAiSuggestion(result)
    } catch (err) {
      console.error('AI Fix Error:', err)
      // We could set an error state here
    } finally {
      setAiLoading(false)
    }
  }

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

        {/* View Code Action */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={handleGetAIFix}
              disabled={aiLoading}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                aiLoading ? 'text-blue-500 animate-pulse' : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              AI Fix
            </button>

            {localPath ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCode(localPath, error.line, error.language);
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors"
              >
                View Code
              </button>
            ) : (
              <span className="text-[10px] text-slate-700 uppercase tracking-wider">No Match</span>
            )}
          </div>
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

      {/* Expanded section */}
      {expanded && (
        <tr className="bg-surface-700/50">
          <td colSpan={9} className="px-6 py-6 space-y-6">
            {/* AI Fix Suggestion (if loading or result exists) */}
            {(aiLoading || aiSuggestion) && (
              <div className="max-w-4xl animate-in slide-in-from-top duration-300">
                {aiLoading ? (
                  <div className="card p-8 flex flex-col items-center justify-center gap-4 bg-surface-900/50 border-dashed">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">AI is analyzing the error...</p>
                      <p className="text-xs text-slate-500 mt-1">Comparing log context with your local codebase.</p>
                    </div>
                  </div>
                ) : (
                  <FixSuggestion suggestion={aiSuggestion} />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Raw Log */}
              <div className="rounded-xl bg-surface-900 border border-white/5 p-4 shadow-inner">
                <p className="text-[11px] text-slate-500 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  Raw Log Entry
                </p>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {error.rawLine || error.message}
                </pre>
              </div>

              {/* Stack Trace */}
              {error.stackFrames?.length > 0 && (
                <div className="rounded-xl bg-surface-900 border border-white/5 p-4 shadow-inner">
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
          </td>
        </tr>
      )}
    </>
  )
}

export default function ErrorTable({ fileResult }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewer, setViewer] = useState({ isOpen: false, filePath: '', line: null, lang: '' })

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
                <ErrorRow 
                  key={error.id} 
                  error={error} 
                  index={i} 
                  onViewCode={(path, line, lang) => setViewer({ isOpen: true, filePath: path, line, lang })}
                />
              ))}
            </tbody>
          </table>
        </div>
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

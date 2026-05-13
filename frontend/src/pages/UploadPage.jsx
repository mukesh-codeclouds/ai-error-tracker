import { useState, useMemo } from 'react'
import DropZone from '../components/upload/DropZone'
import FileList from '../components/upload/FileList'
import UploadProgress from '../components/upload/UploadProgress'
import FormatOverride from '../components/parser/FormatOverride'
import ErrorTable from '../components/errors/ErrorTable'
import useSessionStore from '../store/useSessionStore'
import CodebaseConnector from '../components/codebase/CodebaseConnector'
import StatsCards from '../components/dashboard/StatsCards'
import ErrorTrendChart from '../components/dashboard/ErrorTrendChart'
import ExportActions from '../components/export/ExportActions'
import FilterSidebar from '../components/dashboard/FilterSidebar'
import { calculateStats, generateTrendData } from '../utils/reportGenerator'

export default function UploadPage() {
  const { uploadedFiles, uploadStatus, uploadProgress, parsedResults, error, clearSession } =
    useSessionStore()
    
  const [filters, setFilters] = useState({ severity: [], language: [], search: '' })

  const isDone = uploadStatus === 'done'
  
  // Filter Logic
  const filteredResults = useMemo(() => {
    if (!isDone) return [];
    
    return parsedResults.map(file => ({
      ...file,
      errors: (file.errors || []).filter(err => {
        const matchSeverity = filters.severity.length === 0 || filters.severity.includes(err.severity);
        const matchLanguage = filters.language.length === 0 || filters.language.includes(err.language);
        const matchSearch = !filters.search || 
          err.message.toLowerCase().includes(filters.search.toLowerCase()) ||
          err.file?.toLowerCase().includes(filters.search.toLowerCase());
          
        return matchSeverity && matchLanguage && matchSearch;
      })
    })).filter(file => file.errors.length > 0 || !filters.search); // Keep files if they have matches or if not searching
  }, [isDone, parsedResults, filters]);

  const stats = isDone ? calculateStats(filteredResults) : null
  const trendData = isDone ? generateTrendData(filteredResults) : []
  
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    parsedResults.forEach(f => {
      f.errors.forEach(e => langs.add(e.language));
    });
    return Array.from(langs);
  }, [parsedResults]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload & Analyse Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Drag-and-drop PHP, Node.js, or Python log files — results appear instantly.
        </p>
      </div>

      {/* Codebase Connection */}
      <CodebaseConnector />

      {/* Upload panel */}
      {!isDone && (
        <div className="card p-6 space-y-4">
          {/* Format override row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Log Format
            </p>
            <FormatOverride />
          </div>

          <DropZone />
          <FileList files={uploadedFiles} />
          <UploadProgress status={uploadStatus} progress={uploadProgress} />
        </div>
      )}

      {/* Error state */}
      {uploadStatus === 'error' && error && (
        <div id="upload-error-banner" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">Upload failed</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
          </div>
          <button
            onClick={clearSession}
            className="text-xs text-red-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {isDone && (
        <div className="space-y-8 animate-slide-up">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Analysis Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                {parsedResults.length} file{parsedResults.length !== 1 ? 's' : ''} processed successfully
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ExportActions stats={stats} results={parsedResults} />
              <div className="h-6 w-px bg-white/10 mx-2" />
              <button
                id="analyse-new-btn"
                onClick={clearSession}
                className="btn-secondary text-xs"
              >
                ↑ Analyse new files
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsCards stats={stats} />

          {/* Visualization Row */}
          <div className="grid grid-cols-1 gap-6">
            <ErrorTrendChart data={trendData} />
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                availableValues={{ languages: availableLanguages }} 
              />
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                  {stats.total} Matching Error{stats.total !== 1 ? 's' : ''}
                </h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              {filteredResults.map((fileResult) => (
                fileResult.errors.length > 0 && (
                  <ErrorTable key={fileResult.fileName} fileResult={fileResult} />
                )
              ))}
              
              {stats.total === 0 && (
                <div className="card p-12 text-center text-slate-500">
                  <p className="text-sm">No errors match your current filters.</p>
                  <button 
                    onClick={() => setFilters({ severity: [], language: [], search: '' })}
                    className="text-blue-400 text-xs mt-2 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

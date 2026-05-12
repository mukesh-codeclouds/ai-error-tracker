import DropZone from '../components/upload/DropZone'
import FileList from '../components/upload/FileList'
import UploadProgress from '../components/upload/UploadProgress'
import FormatOverride from '../components/parser/FormatOverride'
import ErrorTable from '../components/errors/ErrorTable'
import useSessionStore from '../store/useSessionStore'
import CodebaseConnector from '../components/codebase/CodebaseConnector'

export default function UploadPage() {
  const { uploadedFiles, uploadStatus, uploadProgress, parsedResults, error, clearSession } =
    useSessionStore()

  const isDone = uploadStatus === 'done'
  const totalErrors = parsedResults.reduce((sum, f) => sum + (f.errors?.length ?? 0), 0)

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
        <div className="space-y-6 animate-slide-up">
          {/* Results summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                {totalErrors} error{totalErrors !== 1 ? 's' : ''} found
                <span className="text-slate-600 font-normal text-sm ml-2">
                  across {parsedResults.length} file{parsedResults.length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>
            <button
              id="analyse-new-btn"
              onClick={clearSession}
              className="btn-secondary text-xs"
            >
              ↑ Analyse new files
            </button>
          </div>

          {/* One ErrorTable per uploaded file */}
          {parsedResults.map((fileResult) => (
            <ErrorTable key={fileResult.fileName} fileResult={fileResult} />
          ))}
        </div>
      )}
    </div>
  )
}

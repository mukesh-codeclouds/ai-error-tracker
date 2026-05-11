export default function UploadProgress({ status, progress }) {
  if (status === 'idle' || status === 'done') return null

  const isUploading = status === 'uploading'
  const isParsing = status === 'parsing'
  const isError = status === 'error'

  return (
    <div id="upload-progress" className="mt-4 card p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {(isUploading || isParsing) && (
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          )}
          {isError && <span className="w-2 h-2 rounded-full bg-red-400" />}
          <span className="text-sm font-medium text-slate-200">
            {isUploading && 'Uploading…'}
            {isParsing && 'Parsing log file…'}
            {isError && 'Upload failed'}
          </span>
        </div>
        <span className="text-sm font-mono text-brand-400">
          {isUploading ? `${progress}%` : isParsing ? '—' : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-600 rounded-full overflow-hidden">
        {isUploading && (
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        )}
        {isParsing && (
          <div className="h-full w-full shimmer rounded-full" />
        )}
        {isError && (
          <div className="h-full w-full bg-red-500/60 rounded-full" />
        )}
      </div>

      {isParsing && (
        <p className="mt-2 text-xs text-slate-500">
          Running regex parsers — PHP · Node.js · Python
        </p>
      )}
    </div>
  )
}

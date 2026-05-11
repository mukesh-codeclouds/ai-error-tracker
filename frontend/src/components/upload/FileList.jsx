function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ name }) {
  const ext = name.split('.').pop().toLowerCase()
  const colors = { gz: 'text-purple-400', log: 'text-blue-400', txt: 'text-green-400' }
  return (
    <div className={`w-8 h-8 rounded-lg bg-surface-600 border border-white/10 flex items-center justify-center text-[10px] font-bold font-mono ${colors[ext] || 'text-slate-400'}`}>
      {ext.toUpperCase().slice(0, 3)}
    </div>
  )
}

export default function FileList({ files = [] }) {
  if (!files.length) return null

  return (
    <div className="mt-4 flex flex-col gap-2 animate-slide-up">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
        Queued Files
      </p>
      {files.map((file, i) => (
        <div
          key={`${file.name}-${i}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-700 border border-white/5"
        >
          <FileIcon name={file.name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          <span className="text-xs text-slate-600 shrink-0">
            {new Date(file.lastModified).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  )
}

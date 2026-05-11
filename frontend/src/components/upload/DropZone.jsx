import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useSessionStore from '../../store/useSessionStore'
import { useLogUpload } from '../../hooks/useLogUpload'

const ACCEPTED_TYPES = {
  'text/plain': ['.log', '.txt'],
  'application/gzip': ['.gz'],
  'application/x-gzip': ['.gz'],
  'application/octet-stream': ['.log', '.gz'],
}

const MAX_SIZE = 500 * 1024 * 1024 // 500 MB

export default function DropZone() {
  const { formatOverride, uploadStatus } = useSessionStore()
  const { upload, isLoading } = useLogUpload()

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        upload(acceptedFiles, formatOverride)
      }
    },
    [upload, formatOverride],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    disabled: isLoading,
    multiple: true,
  })

  const sizeErrors = fileRejections.filter((r) =>
    r.errors.some((e) => e.code === 'file-too-large'),
  )
  const typeErrors = fileRejections.filter((r) =>
    r.errors.some((e) => e.code === 'file-invalid-type'),
  )

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        id="dropzone-area"
        className={`
          relative flex flex-col items-center justify-center
          border-2 border-dashed rounded-2xl
          p-12 cursor-pointer
          transition-all duration-300 select-none
          ${isDragActive
            ? 'border-brand-400 bg-brand-500/5 shadow-glow dropzone-active'
            : 'border-white/10 bg-surface-800 hover:border-brand-500/50 hover:bg-surface-700/50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} id="dropzone-input" />

        {/* Icon */}
        <div className={`mb-5 p-4 rounded-2xl transition-all duration-300 ${isDragActive ? 'bg-brand-500/20 shadow-glow' : 'bg-surface-700'}`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={`transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
            <path d="M20 4v22M10 12l10-8 10 8" stroke={isDragActive ? '#818cf8' : '#4b5563'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 30h28M6 36h28" stroke={isDragActive ? '#818cf8' : '#374151'} strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {isDragActive ? (
          <p className="text-brand-300 font-semibold text-lg">Drop your log files here…</p>
        ) : (
          <>
            <p className="text-white font-semibold text-base mb-1">
              Drag & drop log files here
            </p>
            <p className="text-slate-500 text-sm mb-4">
              or <span className="text-brand-400 underline underline-offset-2 cursor-pointer">browse files</span>
            </p>
            <div className="flex items-center gap-2">
              {['.log', '.txt', '.gz'].map((ext) => (
                <span key={ext} className="px-2.5 py-0.5 rounded-md bg-surface-600 border border-white/10 text-xs text-slate-400 font-mono">
                  {ext}
                </span>
              ))}
              <span className="text-xs text-slate-600">· max 500 MB per file</span>
            </div>
          </>
        )}
      </div>

      {/* Validation errors */}
      {sizeErrors.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {sizeErrors.map(({ file }) => (
            <p key={file.name}>⚠ <strong>{file.name}</strong> exceeds 500 MB limit</p>
          ))}
        </div>
      )}
      {typeErrors.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400">
          {typeErrors.map(({ file }) => (
            <p key={file.name}>✕ <strong>{file.name}</strong> is not a supported file type</p>
          ))}
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useRef } from 'react'
import useCodebaseStore from '../../store/useCodebaseStore'
import { useFilePicker } from '../../hooks/useFilePicker'

export default function CodebaseConnector() {
  const { directoryHandle, rootName, status, totalFiles, isPermissionGranted, setStatus, updateIndex, setError } = useCodebaseStore()
  const { connect, requestPermission, logout } = useFilePicker()
  const workerRef = useRef(null)

  // Trigger indexing when permission is granted or directory changes
  useEffect(() => {
    if (directoryHandle && isPermissionGranted && status !== 'indexing') {
      startIndexing()
    }
  }, [directoryHandle, isPermissionGranted])

  const startIndexing = () => {
    setStatus('indexing')
    
    if (workerRef.current) {
      workerRef.current.terminate()
    }

    workerRef.current = new Worker(new URL('../../workers/indexer.worker.js', import.meta.url), {
      type: 'module'
    })

    workerRef.current.onmessage = (e) => {
      const { type, fileIndex, totalFiles, error, currentPath } = e.data
      
      if (type === 'progress') {
        // We could show currentPath if we want detailed progress
      } else if (type === 'complete') {
        updateIndex(fileIndex, totalFiles)
      } else if (type === 'error') {
        setError(error)
      }
    }

    workerRef.current.postMessage({ directoryHandle })
  }

  const handleConnect = async () => {
    await connect()
  }

  const handleGrantPermission = async () => {
    const granted = await requestPermission()
    if (granted) startIndexing()
  }

  return (
    <div className="card p-5 border-dashed border-2 border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg ${
            status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 
            status === 'indexing' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/30 text-slate-500'
          }`}>
            {status === 'connected' ? '✓' : status === 'indexing' ? '⌛' : '📁'}
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {rootName || 'Local Codebase'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === 'connected' ? `${totalFiles.toLocaleString()} files indexed` : 
               status === 'indexing' ? 'Scanning local files...' : 
               'Connect local project for AI mapping'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'disconnected' && (
            <button onClick={handleConnect} className="btn-primary py-1.5 px-4 text-xs font-semibold">
              Connect Folder
            </button>
          )}
          
          {directoryHandle && !isPermissionGranted && (
            <button onClick={handleGrantPermission} className="btn-primary py-1.5 px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-600">
              Grant Access
            </button>
          )}

          {(status === 'connected' || status === 'indexing') && (
            <button onClick={logout} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
              Disconnect
            </button>
          )}
        </div>
      </div>
      
      {status === 'indexing' && (
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse-slow w-full origin-left"></div>
        </div>
      )}
    </div>
  )
}

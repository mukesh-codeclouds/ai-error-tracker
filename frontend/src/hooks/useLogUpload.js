import { useCallback } from 'react'
import { uploadLogs } from '../services/api'
import useSessionStore from '../store/useSessionStore'

/**
 * Hook that orchestrates file upload → parse flow.
 * Returns { upload, isUploading, isLoading }
 */
export function useLogUpload() {
  const { uploadStatus, setFiles, setProgress, setStatus, setResults, setError } =
    useSessionStore()

  const upload = useCallback(
    async (files, formatOverride = null) => {
      if (!files?.length) return

      try {
        setFiles(files)
        setStatus('uploading')
        setProgress(0)

        const data = await uploadLogs(files, formatOverride, (pct) => {
          setProgress(pct)
          if (pct === 100) setStatus('parsing')
        })

        setResults(data)
      } catch (err) {
        setError(err.message)
      }
    },
    [setFiles, setProgress, setStatus, setResults, setError],
  )

  const isUploading = uploadStatus === 'uploading'
  const isParsing = uploadStatus === 'parsing'
  const isLoading = isUploading || isParsing

  return { upload, isUploading, isParsing, isLoading }
}

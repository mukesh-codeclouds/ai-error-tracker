import { create } from 'zustand'

const useSessionStore = create((set) => ({
  sessionId: null,
  uploadedFiles: [],
  uploadStatus: 'idle', // 'idle' | 'uploading' | 'parsing' | 'done' | 'error'
  uploadProgress: 0,
  parsedResults: [],
  detectedFormat: null, // 'php' | 'nodejs' | 'python' | 'unknown' | null
  formatOverride: null, // 'php' | 'nodejs' | 'python' | null
  error: null,

  // Actions
  setFiles: (files) => set({ uploadedFiles: files }),
  setProgress: (pct) => set({ uploadProgress: pct }),
  setStatus: (status) => set({ uploadStatus: status }),
  setResults: (data) =>
    set({
      parsedResults: data.files,
      sessionId: data.sessionId,
      uploadStatus: 'done',
      uploadProgress: 100,
    }),
  setError: (msg) => set({ error: msg, uploadStatus: 'error' }),
  setFormatOverride: (fmt) => set({ formatOverride: fmt }),
  clearSession: () =>
    set({
      sessionId: null,
      uploadedFiles: [],
      uploadStatus: 'idle',
      uploadProgress: 0,
      parsedResults: [],
      detectedFormat: null,
      formatOverride: null,
      error: null,
    }),
}))

export default useSessionStore

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 120_000, // 2 min for large files
})

// ── Request interceptor ──────────────────────────────────────
api.interceptors.request.use((config) => {
  return config
})

// ── Response interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

/**
 * Upload one or more log files to the backend.
 * @param {File[]} files
 * @param {string|null} formatOverride
 * @param {(pct: number) => void} onProgress
 */
export async function uploadLogs(files, formatOverride = null, onProgress) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  if (formatOverride) formData.append('formatOverride', formatOverride)

  const response = await api.post('/api/logs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (evt.total) {
        onProgress?.(Math.round((evt.loaded / evt.total) * 100))
      }
    },
  })

  return response.data
}

export default api

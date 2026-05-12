import { useCallback, useEffect } from 'react'
import { get, set, del } from 'idb-keyval'
import useCodebaseStore from '../store/useCodebaseStore'

const DB_KEY = 'codebase_handle'

export function useFilePicker() {
  const { setDirectory, setPermission, disconnect, directoryHandle } = useCodebaseStore()

  // Load handle from IndexedDB on mount
  useEffect(() => {
    async function loadHandle() {
      try {
        const handle = await get(DB_KEY)
        if (handle) {
          // Check if we still have permission
          const mode = 'read'
          if ((await handle.queryPermission({ mode })) === 'granted') {
            setDirectory(handle, handle.name)
          } else {
            // We have the handle but need to request permission again
            setDirectory(handle, handle.name)
            setPermission(false)
          }
        }
      } catch (err) {
        console.error('Failed to load codebase handle:', err)
      }
    }
    loadHandle()
  }, [setDirectory, setPermission])

  const connect = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'read'
      })
      
      await set(DB_KEY, handle)
      setDirectory(handle, handle.name)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to select directory:', err)
      }
    }
  }, [setDirectory])

  const requestPermission = useCallback(async () => {
    if (!directoryHandle) return false
    
    try {
      const mode = 'read'
      const status = await directoryHandle.requestPermission({ mode })
      if (status === 'granted') {
        setPermission(true)
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to request permission:', err)
      return false
    }
  }, [directoryHandle, setPermission])

  const logout = useCallback(async () => {
    await del(DB_KEY)
    disconnect()
  }, [disconnect])

  return { connect, requestPermission, logout }
}

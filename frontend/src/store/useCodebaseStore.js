import { create } from 'zustand'

const useCodebaseStore = create((set) => ({
  directoryHandle: null,
  rootName: '',
  status: 'disconnected', // 'disconnected' | 'connecting' | 'indexing' | 'connected'
  fileIndex: {}, // filename -> relative paths array
  totalFiles: 0,
  isPermissionGranted: false,
  error: null,

  // Actions
  setDirectory: (handle, name) => set({ 
    directoryHandle: handle, 
    rootName: name, 
    status: 'connected',
    isPermissionGranted: true 
  }),
  
  setStatus: (status) => set({ status }),
  
  updateIndex: (index, count) => set({ 
    fileIndex: index, 
    totalFiles: count,
    status: 'connected'
  }),
  
  setPermission: (granted) => set({ isPermissionGranted: granted }),
  
  setError: (err) => set({ error: err, status: 'disconnected' }),
  
  disconnect: () => set({
    directoryHandle: null,
    rootName: '',
    status: 'disconnected',
    fileIndex: {},
    totalFiles: 0,
    isPermissionGranted: false,
    error: null
  })
}))

export default useCodebaseStore

# Phase 2 Engineering Plan
## Track Fast Error With AI — File System Access API + Client-side Codebase Indexer

**Phase:** 2 of 5
**Timeline:** Week 3–4 (10 working days)
**Owner:** Engineering Lead
**Status:** Planning
**PRD Reference:** §5.1 In Scope (v1.0), FR-02, §10 Technical Architecture, §11 Milestones

---

## 1. Phase 2 Goal

Implement the local codebase connection functionality using the browser's **File System Access API**. This phase focuses on allowing users to grant the SaaS app read-only access to their local project folder, building a client-side index of file paths, and providing a UI to manage this connection. **Crucially, no source code is uploaded to the server.**

**Deliverables at end of Phase 2:**
- ✅ "Connect Local Codebase" button using `window.showDirectoryPicker()`
- ✅ Recursive directory crawler (up to 10 levels deep)
- ✅ Client-side file path indexer (storing relative paths + extensions)
- ✅ Codebase connection status UI (Connected / Disconnected / Indexing)
- ✅ Persistent folder handle storage (via IndexedDB for session persistence)
- ✅ UI feedback for indexing progress (Total files found, current directory)
- ✅ Basic "Code Viewer" component to display local files in-browser

---

## 2. Tech Stack Decisions

| Layer | Decision | Rationale |
|---|---|---|
| **API** | File System Access API | Modern browser API for secure, read-only local file access |
| **Storage** | `idb-keyval` | Lightweight wrapper for IndexedDB to store `FileSystemDirectoryHandle` |
| **Indexing** | Web Workers | Run the heavy recursive file crawling in a background thread to keep UI responsive |
| **Data Structure**| Trie or Map | Fast lookup for file path matching (e.g., `src/App.js` matches against log paths) |
| **Code Viewer** | `react-syntax-highlighter` | Lightweight component for rendering code snippets with syntax highlighting |

---

## 3. Project Folder Structure Updates

```
track-errors/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── codebase/
│   │   │   │   ├── CodebaseConnector.jsx  ← Main connection UI + Button
│   │   │   │   ├── IndexingProgress.jsx   ← Animated progress/status
│   │   │   │   └── FolderPathDisplay.jsx  ← Shows currently linked root
│   │   │   ├── viewer/
│   │   │   │   └── CodeSnippet.jsx        ← Syntax-highlighted code block
│   │   ├── workers/
│   │   │   └── indexer.worker.js          ← Web Worker for recursive indexing
│   │   ├── store/
│   │   │   └── useCodebaseStore.js        ← Zustand store for codebase state
│   │   ├── hooks/
│   │   │   └── useFilePicker.js           ← Hook for showDirectoryPicker logic
│   │   └── utils/
│   │       ├── fileSystem.js              ← FS Access API helpers
│   │       └── pathMatcher.js             ← Logic to map log paths to local paths
```

---

## 4. File System Access Flow

1. **Permission Grant:** User clicks "Connect Codebase" → `showDirectoryPicker({ mode: 'read' })`.
2. **Persistence:** The `FileSystemDirectoryHandle` is stored in IndexedDB using `idb-keyval`.
3. **Re-authentication:** On page reload, the app attempts to retrieve the handle. If found, it prompts the user to re-grant permission (browser security requirement).
4. **Crawling:** A Web Worker starts:
   - Recurse through directories (skip `.git`, `node_modules`, `vendor`, `__pycache__`).
   - Collect every file path relative to the root.
   - Build a Map: `Filename -> [FullRelativePath1, FullRelativePath2]`.
5. **UI Updates:** The store updates `isIndexing`, `fileCount`, and `lastIndexed`.

---

## 5. Zustand Store Shape (New)

```js
// store/useCodebaseStore.js
{
  directoryHandle: null,    // FileSystemDirectoryHandle
  rootName: '',             // string (e.g., "my-project")
  status: 'disconnected',   // 'disconnected' | 'connecting' | 'indexing' | 'connected'
  fileIndex: {},            // Map<string, string[]> (filename -> relative paths)
  totalFiles: 0,
  isPermissionGranted: false,

  // Actions
  setDirectory: (handle) => {},
  updateIndex: (index) => {},
  disconnect: () => {},
  setPermission: (granted) => {},
}
```

---

## 6. Day-by-Day Task Breakdown

### Week 3 (Days 11–15) — FS Connection + Storage

| Day | Tasks |
|---|---|
| **Day 11** | Research & Prototype: Small PoC for `showDirectoryPicker` and reading a single file's content; test in Chrome and Edge. |
| **Day 12** | Build `useFilePicker` hook; implement handle storage in IndexedDB (`idb-keyval`); handle re-permission flow on refresh. |
| **Day 13** | Build `CodebaseConnector.jsx` UI; add "Connect" and "Disconnect" buttons; display project root folder name. |
| **Day 14** | Logic: Recursive directory crawler (main thread version) with basic exclusion list (`node_modules`, etc.); track file count. |
| **Day 15** | Integrations: Connect `CodebaseConnector` to `useCodebaseStore`; show "Connected" status persistent across reloads. |

### Week 4 (Days 16–20) — Worker Indexer + Path Matching

| Day | Tasks |
|---|---|
| **Day 16** | Offload indexing to `indexer.worker.js`; implement messaging between UI and Worker; add `IndexingProgress` UI with spinner. |
| **Day 17** | Refine Indexer: Add deeper exclusion lists (PHP/Node/Python defaults); limit depth to 10 levels; optimize for 10k+ files. |
| **Day 18** | `pathMatcher.js`: Logic to take a log file path (e.g., `/var/www/html/app/User.php`) and match it against the local index (`app/User.php`). |
| **Day 19** | `CodeSnippet.jsx`: Component to read file content via `FileSystemFileHandle` and render with `react-syntax-highlighter`. |
| **Day 20** | Phase 2 QA: Test with large repos; verify memory usage; performance tuning; demo of "Connect -> Index -> View File". |

---

## 7. Acceptance Criteria — Phase 2 Complete

| # | Criterion | How Verified |
|---|---|---|
| AC-13 | User can select a local folder via standard browser picker | Manual UI test |
| AC-14 | Codebase connection persists across page reloads (requires re-permission) | Refresh page, check IDB |
| AC-15 | Indexer skips `node_modules`, `.git`, `vendor` by default | Verify file count on a test repo |
| AC-16 | Indexing happens in a background worker (UI remains responsive) | Drag UI during indexing |
| AC-17 | System handles nested folders up to 10 levels deep | Test with deeply nested project |
| AC-18 | Error paths from Phase 1 logs can be matched to local files | Console log match results |
| AC-19 | "Disconnect" button clears the handle and the local index | Manual UI test |
| AC-20 | Selected file content can be read and displayed in the UI | Click "View" on a matched file |

---

## 8. Definition of Done — Phase 2

- [ ] All 8 acceptance criteria pass.
- [ ] Indexer unit tests pass (mocking FileSystem API).
- [ ] No regressions in Phase 1 (Log upload still works).
- [ ] Memory usage remains under 200MB for a 5,000-file index.
- [ ] Code reviewed and merged to `main`.
- [ ] Demo-ready: Connect a local folder and see the file count update in real-time.

---

*Document Owner: Engineering Lead | Phase: 2 | Stack: React + FS Access API | Next Review: End of Day 15*

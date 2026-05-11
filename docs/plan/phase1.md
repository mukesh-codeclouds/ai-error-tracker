# Phase 1 Engineering Plan
## Track Fast Error With AI — SaaS App Scaffold + Log Upload + Parsers

**Phase:** 1 of 5
**Timeline:** Week 1–2 (10 working days)
**Owner:** Engineering Lead
**Status:** Planning
**PRD Reference:** §5.1 In Scope (v1.0), FR-01, §10 Technical Architecture, §11 Milestones

---

## 1. Phase 1 Goal

Stand up the full SaaS application skeleton — frontend (React SPA) and backend (Node.js API) — with a fully working log file upload flow and regex-based parsers for PHP, Node.js, and Python log formats. No AI integration yet; all parsing in Phase 1 is deterministic (regex).

**Deliverables at end of Phase 1:**
- ✅ React SPA running locally and deployable to cloud
- ✅ Backend Node.js API running with health check
- ✅ Drag-and-drop / file picker log upload UI
- ✅ `.gz` server-side decompression
- ✅ PHP, Node.js, Python regex log parsers
- ✅ Parsed error list rendered in UI (no AI yet — raw parse results)
- ✅ Auto-detect log format (PHP / Node.js / Python) with manual override

---

## 2. Tech Stack Decisions

| Layer | Decision | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast DX, small bundle, HMR, easy SPA routing |
| **Styling** | Tailwind CSS v3 | Rapid utility-first styling, consistent design tokens |
| **Routing** | React Router v6 | Standard SPA routing |
| **State** | Zustand | Lightweight, no boilerplate, easy for session state |
| **File Upload UI** | `react-dropzone` | Accessible, battle-tested drag-and-drop |
| **HTTP Client** | Axios | Interceptors for auth headers & error handling |
| **Backend** | Node.js 20 + Express 5 | Stateless, fast, same language as frontend devs |
| **`.gz` Decompress** | Node.js built-in `zlib` | No extra dependency, streams-based |
| **Log Parsing** | Custom Regex modules | One module per stack (PHP / Node / Python) |
| **File Upload (server)** | `multer` | Handles multipart form data, memory/disk storage |
| **Environment Config** | `dotenv` | Standard env var management |
| **Dev Tooling** | ESLint + Prettier + Husky | Code quality from day 1 |
| **Testing** | Vitest (FE) + Jest (BE) | Fast unit tests, same config as Vite |

---

## 3. Project Folder Structure

```
track-errors/
├── docs/
│   ├── prd.md
│   └── plan/
│       └── phase1.md           ← this file
│
├── frontend/                   ← React SPA (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/             ← static icons, images
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.jsx        ← top nav + sidebar wrapper
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── upload/
│   │   │   │   ├── DropZone.jsx        ← drag-and-drop upload area
│   │   │   │   ├── FileList.jsx        ← uploaded files list
│   │   │   │   └── UploadProgress.jsx  ← progress bar per file
│   │   │   ├── parser/
│   │   │   │   ├── FormatBadge.jsx     ← PHP / Node / Python chip
│   │   │   │   └── FormatOverride.jsx  ← manual format selector
│   │   │   └── errors/
│   │   │       ├── ErrorTable.jsx      ← raw parsed results table
│   │   │       └── ErrorRow.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         ← marketing/entry page
│   │   │   ├── UploadPage.jsx          ← main upload + parse page
│   │   │   └── NotFoundPage.jsx
│   │   ├── store/
│   │   │   └── useSessionStore.js      ← Zustand session store
│   │   ├── services/
│   │   │   └── api.js                  ← Axios instance + upload fn
│   │   ├── hooks/
│   │   │   └── useLogUpload.js         ← upload + polling logic
│   │   ├── utils/
│   │   │   └── formatDetector.js       ← client-side format hint
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    ← Node.js Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js                ← mounts all routers
│   │   │   └── logs.route.js           ← POST /api/logs/upload
│   │   ├── controllers/
│   │   │   └── logs.controller.js      ← request handler
│   │   ├── services/
│   │   │   ├── decompressor.service.js ← .gz → plain text (zlib)
│   │   │   ├── parser/
│   │   │   │   ├── index.js            ← parser dispatcher
│   │   │   │   ├── php.parser.js       ← PHP error regex parser
│   │   │   │   ├── nodejs.parser.js    ← Node.js error regex parser
│   │   │   │   └── python.parser.js    ← Python error regex parser
│   │   │   └── formatDetector.service.js ← auto-detect PHP/Node/Python
│   │   ├── middleware/
│   │   │   ├── upload.middleware.js    ← multer config (500 MB limit)
│   │   │   └── errorHandler.js         ← global error handler
│   │   ├── config/
│   │   │   └── index.js                ← env vars + constants
│   │   └── app.js                      ← Express app setup
│   ├── server.js                       ← entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. API Contract — Phase 1

### `POST /api/logs/upload`

**Purpose:** Accept one or more log files, decompress if `.gz`, detect format, parse errors.

**Request:**
```
Content-Type: multipart/form-data

Fields:
  files[]        — one or more .log / .txt / .gz files (max 500 MB each)
  formatOverride — optional: "php" | "nodejs" | "python"
```

**Response (200 OK):**
```json
{
  "sessionId": "uuid-v4",
  "files": [
    {
      "fileName": "laravel.log",
      "originalSize": 2048000,
      "detectedFormat": "php",
      "overrideApplied": false,
      "parseTimeMs": 340,
      "errors": [
        {
          "id": "err_001",
          "timestamp": "2026-05-07T14:23:11Z",
          "language": "php",
          "errorType": "Fatal Error",
          "severity": "critical",
          "message": "Call to undefined function foo() in /var/www/app/Http/Controllers/HomeController.php on line 42",
          "file": "/var/www/app/Http/Controllers/HomeController.php",
          "line": 42,
          "rawLine": "[07-May-2026 14:23:11 UTC] PHP Fatal error: Call to undefined function..."
        }
      ],
      "summary": {
        "total": 18,
        "critical": 2,
        "high": 5,
        "medium": 8,
        "low": 3
      }
    }
  ]
}
```

**Error Responses:**
| Code | Scenario |
|---|---|
| `400` | No files attached / unsupported file type |
| `413` | File exceeds 500 MB |
| `422` | File is not a readable log (binary, image, etc.) |
| `500` | Decompression or parse failure |

---

## 5. Log Parser Specifications

### 5.1 Auto-Format Detection Logic (`formatDetector.service.js`)

Scan the **first 50 lines** of the log for signature patterns:

| Signature Pattern | Detected Format |
|---|---|
| `PHP Fatal error:`, `PHP Warning:`, `PHP Parse error:`, `Uncaught` | `php` |
| `UnhandledPromiseRejection`, `TypeError:`, `ReferenceError:`, `at Object.` | `nodejs` |
| `Traceback (most recent call last)`, `File "`, `SyntaxError:`, `ModuleNotFoundError` | `python` |
| No match | `unknown` → user prompted to select manually |

Scoring: count signature hits, pick the format with the highest score.

---

### 5.2 PHP Parser (`php.parser.js`)

**Patterns to extract:**

| Error Type | Regex Pattern | Severity |
|---|---|---|
| Fatal Error | `/\[.*?\] PHP Fatal error:\s*(.+?) in (.+?) on line (\d+)/` | Critical |
| Parse Error | `/\[.*?\] PHP Parse error:\s*(.+?) in (.+?) on line (\d+)/` | Critical |
| Uncaught Exception | `/\[.*?\] PHP Fatal error:\s*Uncaught (.+?) in (.+?):(\d+)/` | High |
| Warning | `/\[.*?\] PHP Warning:\s*(.+?) in (.+?) on line (\d+)/` | Medium |
| Notice | `/\[.*?\] PHP Notice:\s*(.+?) in (.+?) on line (\d+)/` | Low |
| Deprecated | `/\[.*?\] PHP Deprecated:\s*(.+?) in (.+?) on line (\d+)/` | Low |

Stack trace lines (`#0`, `#1`, …) are grouped under the preceding error entry.

**Timestamp parsing:** `[07-May-2026 14:23:11 UTC]` → ISO 8601

---

### 5.3 Node.js Parser (`nodejs.parser.js`)

**Patterns to extract:**

| Error Type | Regex Pattern | Severity |
|---|---|---|
| UnhandledPromiseRejection | `/UnhandledPromiseRejectionWarning:\s*(.+)/` | Critical |
| TypeError | `/TypeError:\s*(.+)/` | High |
| ReferenceError | `/ReferenceError:\s*(.+)/` | High |
| SyntaxError | `/SyntaxError:\s*(.+)/` | High |
| Generic Error | `/Error:\s*(.+)/` | Medium |
| Stack frame | `/^\s+at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/` | — (attach to parent error) |

PM2 log prefix stripping: `YYYY-MM-DD HH:mm:ss: ` removed before parsing.

---

### 5.4 Python Parser (`python.parser.js`)

**Patterns to extract:**

Traceback blocks are multi-line — parser operates in **state-machine mode**:

```
State: IDLE
  → sees "Traceback (most recent call last):" → State: IN_TRACEBACK

State: IN_TRACEBACK
  → sees `  File "path", line N, in fn` → collect frame
  → sees error line (e.g. "ValueError: ...") → emit error, State: IDLE
```

| Error Type | Trigger Pattern | Severity |
|---|---|---|
| SyntaxError | `SyntaxError:` | Critical |
| ImportError / ModuleNotFoundError | `ImportError:` / `ModuleNotFoundError:` | High |
| RuntimeError | `RuntimeError:` | High |
| AttributeError | `AttributeError:` | High |
| TypeError | `TypeError:` | High |
| ValueError | `ValueError:` | Medium |
| Generic Exception | `Exception:` | Medium |
| KeyError / IndexError | `KeyError:` / `IndexError:` | Low |

---

## 6. Severity Classification Rules

| Severity | Definition |
|---|---|
| **Critical** | Fatal/Parse errors that halt execution; UnhandledPromiseRejection; Python SyntaxError |
| **High** | Uncaught exceptions, TypeError, ReferenceError, ImportError — likely to break a feature |
| **Medium** | Warnings, RuntimeError, ValueError — degraded behavior but app continues |
| **Low** | Notices, Deprecated, KeyError — informational, low immediate impact |

---

## 7. Day-by-Day Task Breakdown

### Week 1 (Days 1–5) — Scaffold + Upload

| Day | Tasks |
|---|---|
| **Day 1** | Initialise monorepo; scaffold Vite+React frontend; scaffold Express backend; configure ESLint, Prettier, Husky, .gitignore, README |
| **Day 2** | Build `AppShell`, `Navbar`, `Sidebar`; set up React Router with `LandingPage` and `UploadPage` routes; apply base Tailwind theme (dark mode, color tokens) |
| **Day 3** | Build `DropZone` component (react-dropzone); `FileList`; `UploadProgress` bar; wire to `useLogUpload` hook + Axios |
| **Day 4** | Backend: `multer` upload middleware (500 MB limit, .log/.txt/.gz only); `decompressor.service.js` (zlib streams for .gz); `POST /api/logs/upload` route skeleton |
| **Day 5** | Connect frontend upload → backend endpoint (CORS configured); end-to-end file flow working; manual smoke test with sample log files |

### Week 2 (Days 6–10) — Parsers + Results UI

| Day | Tasks |
|---|---|
| **Day 6** | `formatDetector.service.js` — scoring-based auto-detection; `FormatBadge` + `FormatOverride` components in UI |
| **Day 7** | `php.parser.js` — all patterns + stack trace grouping + timestamp normalisation; unit tests (20 cases) |
| **Day 8** | `nodejs.parser.js` — all patterns + stack frame attachment + PM2 prefix stripping; unit tests (20 cases) |
| **Day 9** | `python.parser.js` — state-machine traceback parser + all error types; unit tests (20 cases) |
| **Day 10** | `ErrorTable` + `ErrorRow` UI components displaying parsed results; severity colour coding; format badge; Phase 1 QA + bug fixes + demo prep |

---

## 8. Frontend State Shape (Zustand)

```js
// store/useSessionStore.js
{
  sessionId: null,              // string | null
  uploadedFiles: [],            // File[]
  uploadStatus: 'idle',         // 'idle' | 'uploading' | 'parsing' | 'done' | 'error'
  uploadProgress: 0,            // 0–100
  parsedResults: [],            // ParsedFile[]  (API response shape)
  detectedFormat: null,         // 'php' | 'nodejs' | 'python' | 'unknown' | null
  formatOverride: null,         // 'php' | 'nodejs' | 'python' | null
  error: null,                  // string | null

  // Actions
  setFiles: (files) => {},
  setProgress: (pct) => {},
  setResults: (results) => {},
  setFormatOverride: (fmt) => {},
  clearSession: () => {},
}
```

---

## 9. Environment Variables

### Backend (`.env`)
```env
PORT=4000
MAX_FILE_SIZE_MB=500
ALLOWED_EXTENSIONS=.log,.txt,.gz
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## 10. Acceptance Criteria — Phase 1 Complete

| # | Criterion | How Verified |
|---|---|---|
| AC-01 | User can drag-and-drop or browse-select `.log`, `.txt`, `.gz` files | Manual UI test |
| AC-02 | Files > 500 MB are rejected with a clear error message | Manual test with oversized file |
| AC-03 | `.gz` file is decompressed server-side; plain content is parsed | Upload a gzipped Laravel log |
| AC-04 | PHP, Node.js, Python logs are auto-detected with ≥ 95% accuracy on test set | Run unit test suite |
| AC-05 | Manual format override works and re-parses the file | Manual UI test |
| AC-06 | PHP Fatal/Parse/Warning/Notice errors are extracted correctly | 20 unit test cases pass |
| AC-07 | Node.js UnhandledPromise/TypeError/ReferenceError + stack frames are extracted | 20 unit test cases pass |
| AC-08 | Python traceback blocks (multi-line) are parsed into single error entries | 20 unit test cases pass |
| AC-09 | Parsed results appear in the UI error table with correct severity, type, file, line | Manual UI test |
| AC-10 | Upload progress bar shows real-time progress during upload | Manual UI test |
| AC-11 | API returns correct error codes for bad input (400, 413, 422) | Postman / Jest integration test |
| AC-12 | Frontend and backend run with single command each (`npm run dev`) | Dev environment test |

---

## 11. Sample Log Files for Testing

Create `backend/test/fixtures/` with:

| File | Purpose |
|---|---|
| `php_laravel.log` | 50-line Laravel log with Fatal, Warning, Notice, stack traces |
| `php_wordpress.log` | wp-debug style errors |
| `nodejs_pm2.log` | PM2-prefixed Node app log with UnhandledPromise + TypeErrors |
| `nodejs_express.log` | Raw Express stderr output |
| `python_django.log` | Django debug log with Tracebacks |
| `python_flask.log` | Flask dev server errors |
| `mixed_unknown.log` | Random content to test "unknown" detection fallback |
| `large.log.gz` | Compressed 50 MB log to verify `.gz` handling |

---

## 12. Definition of Done — Phase 1

- [ ] All 12 acceptance criteria pass
- [ ] 60 parser unit tests pass (20 per stack)
- [ ] No ESLint errors in either workspace
- [ ] Backend API tested in Postman (collection exported to `docs/plan/postman/`)
- [ ] README updated with local setup instructions
- [ ] Code reviewed and merged to `main` branch
- [ ] Demo-ready: walkthrough of upload → auto-detect → parsed error table

---

## 13. Phase 2 Preview (Not in Scope for Phase 1)

Phase 2 will add:
- File System Access API (`showDirectoryPicker`) for local codebase connection
- Client-side in-browser codebase indexer
- UI for folder selection + indexing progress

*Do not begin Phase 2 work until Phase 1 DoD is fully met.*

---

*Document Owner: Engineering Lead | Phase: 1 | Stack: React + Node.js | Next Review: End of Day 5 (mid-sprint check-in)*

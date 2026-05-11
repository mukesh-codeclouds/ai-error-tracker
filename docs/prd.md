# Product Requirements Document (PRD)
## Track Fast Error With AI

**Document Version:** 1.2
**Date:** May 8, 2026
**Product Manager:** Senior PM
**Deployment Model:** SaaS Web App
**Status:** Refined Draft — Critical Issues Resolved

---

## 1. Executive Summary

"Track Fast Error With AI" is a SaaS web application that automatically scans `*.log` files, identifies errors, traces them back to their source files in a locally-connected codebase, and delivers AI-powered fix suggestions — dramatically reducing MTTR for PHP, Node.js, and Python projects.

---

## 2. Problem Statement

Developers manually scanning verbose log files to locate errors and cross-reference source files lose 30–45 minutes per bug. This is slow and error-prone — especially across PHP, Node.js, and Python stacks that each have different log formats and stack trace conventions.

**Pain Points:**
- PHP errors (fatal, parse, warnings), Node.js unhandled rejections, and Python tracebacks all look different — no unified viewer exists
- Mapping a log error to the exact source file requires deep project knowledge
- No tool bridges log analysis + local codebase navigation + fix suggestion in a SaaS experience

---

## 3. Goals & Objectives

| Goal | Metric |
|---|---|
| Reduce error-to-fix time | From avg. 45 min → under 5 min |
| Increase developer productivity | 30% reduction in debugging time |
| Improve code quality | 20% fewer recurring errors per sprint |
| Junior dev independence | Resolve errors without senior guidance |

---

## 4. Target Users

| Persona | Description |
|---|---|
| **PHP Developer** | Laravel / WordPress / CodeIgniter; needs to trace fatal errors and exceptions |
| **Node.js Developer** | Express / NestJS; needs to resolve unhandled promise rejections and stack traces |
| **Python Developer** | Django / Flask / FastAPI; needs to locate tracebacks and runtime errors |
| **DevOps / SRE** | Triage production log dumps across multiple stacks rapidly |
| **Junior Developer** | Needs guided fix suggestions without deep codebase familiarity |
| **Tech Lead** | Needs error trend visibility and recurring issue tracking |

---

## 5. Scope

### 5.1 In Scope (v1.0)
- Upload `*.log` files via SaaS web UI (drag-and-drop or file picker)
- Connect local codebase via **browser folder picker** (File System Access API — `showDirectoryPicker`)
- AI error extraction and classification for **PHP, Node.js, and Python** log formats
- Automatic source file + line number mapping from local codebase
- Inline AI fix suggestion per error with code snippets
- Error severity dashboard with filters and export
- Secure in-session processing — no codebase data stored server-side

### 5.2 Out of Scope (v1.0)
- GitHub / GitLab / Bitbucket remote repo integration
- Real-time log streaming / live tail
- Auto-applying code fixes (write-back to files)
- IDE plugin (VS Code, JetBrains)
- Languages beyond PHP, Node.js, Python
- Multi-cloud log aggregation (CloudWatch, Datadog, Sentry)

---

## 6. Supported Log Formats

| Stack | Log Sources | Error Patterns Detected |
|---|---|---|
| **PHP** | Apache error log, PHP-FPM log, Laravel `laravel.log` | Fatal Error, Parse Error, Warning, Exception, Stack Trace |
| **Node.js** | PM2 logs, Express custom logs, `stdout` error dumps | UnhandledPromiseRejection, TypeError, ReferenceError, Stack Trace |
| **Python** | Gunicorn logs, Django `debug.log`, Flask/FastAPI output | Traceback, Exception, SyntaxError, RuntimeError, ImportError |

---

## 7. Functional Requirements

### FR-01 · Log File Ingestion (SaaS Web App)
- User uploads one or more `*.log` files via drag-and-drop or file picker in the browser
- Accepts `.log`, `.txt`, and `.gz` compressed files up to 500 MB
- `.gz` files are decompressed **server-side** before parsing; decompressed content is not persisted after the session
- Auto-detects log format: PHP / Node.js / Python (with manual override option)
- Progress bar shown during upload and parsing

### FR-02 · Local Codebase Connection
- User selects a **local folder via browser folder picker** — browser uses the File System Access API (`showDirectoryPicker`) to grant read-only access
- No codebase files are uploaded to the server; all file indexing happens client-side in-browser
- System builds a lightweight in-memory index of file paths, function/class names, and line references
- Supports nested directory structures up to 10 levels deep

### FR-03 · AI Error Detection
- AI scans the log and extracts all error-level entries per stack:
  - PHP: `Fatal error`, `Parse error`, `Uncaught Exception`, `Warning`
  - Node.js: `UnhandledPromiseRejectionWarning`, `TypeError`, `Error:`, stack frames
  - Python: `Traceback (most recent call last)`, `Exception`, `Error:` lines
- Each error tagged with: timestamp, language, error type, severity (Critical / High / Medium / Low)

### FR-04 · Source File Location Mapping
- AI cross-references stack trace file paths + line numbers against the local codebase index
- Displays: matched file path (relative to project root), exact line number, surrounding code snippet (±5 lines)
- Confidence score shown per match (High / Medium / Low)
- Manual override: user can re-map an error to a different file if AI match is incorrect

### FR-05 · AI Fix Suggestions
- For each located error, AI provides:
  - Plain-language explanation of the root cause
  - 1–3 fix options ranked by confidence
  - Code snippet demonstrating the fix (language-specific)
- "Copy Fix" button and "Open File" button (opens file at line in browser-based code viewer)

### FR-08 · AI Model Selection
- User can select their preferred AI provider from the settings panel before or during a session
- **Supported providers (v1.0):**
  - **OpenAI** — GPT-4o, GPT-4 Turbo
  - **Anthropic** — Claude 3.5 Sonnet, Claude 3 Haiku
  - **Google** — Gemini 1.5 Pro, Gemini 1.5 Flash
  - **Open Source / Self-hosted** — Ollama (Llama 3, Mistral, CodeLlama) via local endpoint URL
- User provides their own API key per provider; keys are stored in browser `localStorage` only, never sent to the server
- Default provider: OpenAI GPT-4o (recommended for accuracy)
- Model selection persists across sessions if the user opts in

### FR-06 · Error Dashboard
- Summary cards: Total Errors, Critical Count, Files Affected, Most Frequent Error Type
- Error list table with columns: Severity, Type, Language, Source File, Line, Timestamp
- Filters: severity, language (PHP / Node / Python), error type, file name, date range
- Error frequency trend chart (if multiple log files uploaded)
- Export: PDF summary report, CSV error list

### FR-07 · Session & Privacy
- All codebase indexing is done client-side (browser memory only)
- Log file content sent to the selected AI provider API only for error extraction — not stored beyond the session
- Session data cleared on tab close or manual "Clear Session" action
- HTTPS enforced; no user account required for basic use (optional account for saving history)

**Privacy Data Flow — What Goes Where:**

| Data Type | Sent to Server | Sent to AI API | Stored Persistently |
|---|---|---|---|
| Log file content (`.log`, `.txt`) | Yes — for parsing | Yes — for error extraction | ❌ No |
| `.gz` file (compressed log) | Yes — decompressed server-side | Yes — extracted content only | ❌ No |
| Codebase files / source code | ❌ Never | ❌ Never | ❌ Never |
| File paths & line references | Client-side only | ❌ Never | ❌ Never |
| User account data (if opted in) | Yes | ❌ Never | ✅ Yes (encrypted) |

> **Note:** Codebase data never leaves the browser. Log data is sent over HTTPS to the AI provider for the duration of the analysis session only.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Log parsing complete within 10s for files ≤ 50 MB; ≤ 30s for 500 MB |
| **Accuracy** | ≥ 90% error-to-file mapping accuracy across PHP, Node.js, Python — measured against a curated test suite of 100 log files per stack (300 total), covering common error patterns and edge cases |
| **Security** | Codebase never leaves the browser; `.gz` logs decompressed server-side and not persisted; all AI API calls over HTTPS |
| **Usability** | First error result displayed within 60s of file upload + folder selection |
| **Scalability** | SaaS infrastructure handles 500 concurrent sessions; auto-scales on cloud |
| **Browser Support** | Chrome 86+, Edge 86+ (File System Access API requirement); Firefox read-only fallback; mobile browsers not supported in v1.0 |
| **Availability** | 99.9% uptime SLA |

---

## 9. User Flow

```
[Open SaaS Web App]
        ↓
[Upload *.log file — PHP / Node.js / Python auto-detected]
        ↓
[Select local codebase folder via browser folder picker]
        ↓
[AI scans log → extracts & classifies errors]
        ↓
[AI maps errors → local source files + line numbers]
        ↓
[Dashboard: Error list with severity, type, file, line]
        ↓
[Click error → view source snippet + AI fix suggestion]
        ↓
[Copy fix / view file in browser code viewer]
        ↓
[Export PDF / CSV report]
```

---

## 10. Technical Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React SPA — File System Access API for local folder reading, in-browser code indexer |
| **AI Engine** | **Multi-provider** — user selects from OpenAI (GPT-4o), Anthropic (Claude 3.5), Google (Gemini 1.5 Pro), or self-hosted open-source via Ollama; backend routes to selected provider |
| **Log Parser** | Regex + LLM hybrid — per-format parsers for PHP, Node.js, Python |
| **Code Indexer** | Client-side JS — builds file path + symbol index from local folder, no upload |
| **Backend API** | Node.js / Python — stateless API, proxies AI calls, `.gz` decompression server-side, no log/code storage |
| **Hosting** | Cloud SaaS (AWS / GCP) with CDN for frontend, auto-scaling backend |
| **Auth (optional)** | Email magic link for saved session history |

---

## 11. Milestones & Timeline

| Phase | Deliverable | Timeline |
|---|---|---|
| **Phase 1** | SaaS app scaffold + log upload + PHP/Node/Python parser | Week 1–2 |
| **Phase 2** | File System Access API + client-side codebase indexer | Week 3–4 |
| **Phase 3** | AI error-to-file mapping + fix suggestions UI | Week 5–6 |
| **Phase 4** | Dashboard, filters, export, privacy audit | Week 7 |
| **Phase 5** | QA, cross-browser testing, performance tuning, beta launch | Week 8 |

---

## 12. Success Metrics (KPIs)

| KPI | Target |
|---|---|
| Mean Time to Error Resolution | < 5 minutes |
| Error-to-File Mapping Accuracy | ≥ 90% across all 3 stacks |
| User Satisfaction (CSAT) | ≥ 4.2 / 5.0 |
| Active Users at 60 days post-launch | 500+ |
| Weekly Retention Rate | ≥ 70% |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| File System Access API not supported on Firefox/Safari | High | Fallback: manual file upload of individual source files |
| Low mapping accuracy for minified/obfuscated PHP or bundled Node.js | High | Detect minification; prompt user to provide source maps |
| Large codebases (10k+ files) slowing client-side indexing | Medium | Lazy indexing — index only directories matching error paths first |
| Diverse custom log formats not matching parsers | Medium | "Unknown format" fallback with user-guided error region selection |
| User concern about log data privacy | Medium | Prominent privacy notice; no-account, no-storage mode by default |

---

## 14. Open Questions

| # | Question | Status |
|---|---|---|
| 1 | Should PHP support extend to WordPress-specific debug logs (`wp-debug.log`) in v1.1? | 🔴 Open |
| 2 | Should Node.js support cover TypeScript source maps for compiled projects? | 🔴 Open |
| 3 | Is a freemium pricing model preferred — free tier (X log files/month) + paid unlimited? | 🔴 Open |
| 4 | Should error history be saved per-user session (requires account) or always ephemeral? | 🔴 Open |
| 5 | Which AI provider should be the default recommendation for new users? | ✅ Resolved — OpenAI GPT-4o (see FR-08) |
| 6 | Cost model per session / API budget per user? | 🟡 TBD — user brings their own API key in v1.0; platform-subsidised tier under evaluation for v1.1 |
| 7 | Where does `.gz` decompression happen — client or server? | ✅ Resolved — Server-side (see FR-01) |

---

*Document Owner: Senior PM | Stacks: PHP · Node.js · Python | Deployment: SaaS Web App*
*Next Step: Share with Engineering Lead for feasibility review → Sprint Planning*

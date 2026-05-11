# Track Fast Error With AI

A SaaS application that ingests PHP, Node.js, and Python log files and extracts structured error data using deterministic regex parsers.

## Phase 1 — Scope
- React SPA (Vite) frontend with drag-and-drop log upload
- Node.js / Express backend with `.gz` decompression
- Auto-detection of log format (PHP / Node.js / Python)
- Regex-based parsers for all three formats
- Parsed error table rendered in the UI

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Runs on http://localhost:4000

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs on http://localhost:5173

## Project Structure
```
track-errors/
├── docs/              ← PRD + Phase plans
├── frontend/          ← React 18 + Vite SPA
└── backend/           ← Node.js 22 + Express 5 API
```

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS v3 |
| State | Zustand |
| HTTP | Axios |
| Backend | Node.js 22 + Express 5 |
| Parsing | Custom regex modules (PHP / Node / Python) |
| Testing | Vitest (FE) + Jest (BE) |

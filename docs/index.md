# AI Error Tracker Documentation

Welcome to the AI Error Tracker documentation. This tool is designed to help developers track, parse, and fix errors in their applications using AI-powered suggestions.

## Key Features

- **Multi-Format Parsing**: Supports PHP (Laravel), Node.js (PM2/Standard), and Python (Traceback) log formats.
- **Log Streaming**: Efficiently handle large log files (500MB+) with zero-memory-leak streaming.
- **Codebase Indexing**: Connect your local codebase via File System Access API to map log errors directly to your source code.
- **AI-Powered Fixes**: Get instant suggestions for fixing errors based on log context and local code.
- **Interactive Dashboard**: Visualize error trends and filter by severity or type.

## Getting Started

1.  **Run the Backend**: `cd backend && npm run dev`
2.  **Run the Frontend**: `cd frontend && npm run dev`
3.  **Upload Logs**: Drag and drop your log files into the dashboard.
4.  **Connect Codebase**: Click "Connect Codebase" to enable local file mapping.

## Architecture

- **Backend**: Node.js/Express with a custom streaming parser engine.
- **Frontend**: React/Vite with Tailwind CSS and Radix UI.
- **AI Integration**: Leverages Google Gemini for error analysis and fix suggestions.

## Performance Optimization

- **Log Streaming**: Uses Node.js `readline` and `fs` streams.
- **Virtualized Lists**: Uses `@tanstack/react-virtual` for smooth UI performance with thousands of errors.
- **Web Workers**: Offloads codebase indexing to a separate thread to keep the UI responsive.

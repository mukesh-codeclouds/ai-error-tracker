# Log Streaming Implementation

To handle large log files (up to 500MB+) without crashing the server, the AI Error Tracker uses a streaming-first architecture.

## How it works

1.  **Multipart Upload**: Files are uploaded using `multer` with `diskStorage`, which saves them directly to the `uploads/` directory on disk.
2.  **Format Detection**: The `getChunk` service reads only the first 8KB of the file to detect the log format (PHP, Node, or Python).
3.  **Streaming Pipeline**: 
    - The `getStream` service creates a readable stream from the disk file.
    - If the file is compressed (`.gz`), it is piped through `zlib.createGunzip()`.
    - The stream is then passed to `parseStream` in the parser engine.
4.  **Line-by-Line Parsing**: 
    - The `readline` module is used to process the stream line-by-line.
    - Each line is fed into a stateful parser that identifies error blocks and stack traces.
5.  **Memory Efficiency**: Since we never load the full file into memory, the Node.js process remains stable even with very large uploads.

## Key Components

- `backend/src/services/decompressor.service.js`: Handles stream creation and chunk reading.
- `backend/src/services/parser/index.js`: Orchestrates the `readline` interface.
- Stateful Parsers: Located in `backend/src/services/parser/*.parser.js`.

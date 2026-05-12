/**
 * Web Worker for recursive codebase indexing.
 * Crawls a FileSystemDirectoryHandle and builds a file path index.
 */

self.onmessage = async (e) => {
  const { directoryHandle, options = {} } = e.data;
  const excludeList = options.exclude || [
    '.git', 'node_modules', 'vendor', 'dist', 'build', 
    '.next', '.cache', '__pycache__', 'venv', '.venv',
    'target', 'out', '.idea', '.vscode'
  ];
  
  const fileIndex = {}; // filename -> array of relative paths
  let totalFiles = 0;

  try {
    async function crawl(handle, relativePath = '') {
      for await (const entry of handle.values()) {
        if (excludeList.includes(entry.name)) continue;

        const path = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.kind === 'directory') {
          // Check depth
          if (path.split('/').length > 10) continue;
          await crawl(entry, path);
        } else {
          const fileName = entry.name;
          if (!fileIndex[fileName]) {
            fileIndex[fileName] = [];
          }
          fileIndex[fileName].push(path);
          totalFiles++;

          // Send progress every 100 files
          if (totalFiles % 100 === 0) {
            self.postMessage({ type: 'progress', totalFiles, currentPath: path });
          }
        }
      }
    }

    await crawl(directoryHandle);
    self.postMessage({ type: 'complete', fileIndex, totalFiles });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};

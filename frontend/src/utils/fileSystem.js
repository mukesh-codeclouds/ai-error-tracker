/**
 * Helpers for interacting with the File System Access API handles.
 */

/**
 * Traverses a directory handle to find a file by its relative path.
 * 
 * @param {FileSystemDirectoryHandle} rootHandle 
 * @param {string} relativePath (e.g. "src/components/App.js")
 * @returns {Promise<FileSystemFileHandle|null>}
 */
export async function getFileHandleByPath(rootHandle, relativePath) {
  if (!rootHandle || !relativePath) return null;

  const parts = relativePath.split('/');
  let currentHandle = rootHandle;

  try {
    // Traverse all parts except the last one (the filename)
    for (let i = 0; i < parts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
    }

    // Get the file handle for the last part
    return await currentHandle.getFileHandle(parts[parts.length - 1]);
  } catch (err) {
    console.error(`Failed to get file handle for path: ${relativePath}`, err);
    return null;
  }
}

/**
 * Reads the text content of a file handle.
 * 
 * @param {FileSystemFileHandle} fileHandle 
 * @returns {Promise<string>}
 */
export async function readFileContent(fileHandle) {
  const file = await fileHandle.getFile();
  return await file.text();
}

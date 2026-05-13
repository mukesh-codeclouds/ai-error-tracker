import React, { useEffect, useState } from 'react';
import useCodebaseStore from '../../store/useCodebaseStore';
import { getFileHandleByPath, readFileContent } from '../../utils/fileSystem';
import CodeSnippet from './CodeSnippet';

export default function CodeViewerModal({ isOpen, onClose, filePath, highlightLine, language }) {
  const { directoryHandle } = useCodebaseStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && filePath && directoryHandle) {
      loadFile();
    }
  }, [isOpen, filePath, directoryHandle]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const handle = await getFileHandleByPath(directoryHandle, filePath);
      if (handle) {
        const text = await readFileContent(handle);
        setContent(text);
      } else {
        setError(`Could not find file: ${filePath}`);
      }
    } catch (err) {
      setError(`Error reading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface-700/50">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{filePath.split('/').pop()}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{filePath}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Reading local file...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-red-400">
              <span className="text-2xl">⚠</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <CodeSnippet 
              code={content} 
              language={language} 
              highlightLine={highlightLine} 
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 flex justify-end bg-surface-700/50">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

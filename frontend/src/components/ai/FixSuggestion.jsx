import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-next';
import { Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import MappingBadge from './MappingBadge';

const FixSuggestion = ({ suggestion, onApply }) => {
  if (!suggestion) return null;

  const { explanation, fixSuggestion, diff, confidence } = suggestion;

  const handleCopy = () => {
    navigator.clipboard.writeText(fixSuggestion);
    // Add toast or feedback here
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} className="animate-pulse" />
          <h3 className="font-semibold">AI Fix Suggestion</h3>
        </div>
        <MappingBadge confidence={confidence} />
      </div>

      <div className="p-6 space-y-6">
        {/* Explanation */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Analysis</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Diff View */}
        {diff && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Proposed Changes</h4>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
              <ReactDiffViewer
                oldValue={diff.oldValue || ''}
                newValue={diff.newValue || ''}
                splitView={false}
                useDarkTheme={document.documentElement.classList.contains('dark')}
              />
            </div>
          </div>
        )}

        {/* Suggestion Code (Fallback or for copy) */}
        {!diff && fixSuggestion && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Suggested Fix</h4>
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {fixSuggestion}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Copy size={16} />
            Copy Fix
          </button>
          
          <button
            onClick={() => onApply?.(fixSuggestion)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-500/20"
          >
            <Check size={16} />
            Apply Fix
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors ml-auto"
          >
            <ExternalLink size={16} />
            Open in Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixSuggestion;

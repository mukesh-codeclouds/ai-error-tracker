import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

/**
 * Renders a code snippet with syntax highlighting and line numbers.
 * 
 * @param {string} code - The source code to display.
 * @param {string} language - The language for syntax highlighting.
 * @param {number} highlightLine - Optional line number to highlight.
 */
export default function CodeSnippet({ code, language = 'javascript', highlightLine = null }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 text-xs font-mono">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={true}
        startingLineNumber={1}
        wrapLines={true}
        lineProps={(lineNumber) => ({
          style: {
            display: 'block',
            backgroundColor: lineNumber === highlightLine ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            borderLeft: lineNumber === highlightLine ? '2px solid #3b82f6' : 'none',
          },
        })}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

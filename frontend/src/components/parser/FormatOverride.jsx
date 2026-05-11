import useSessionStore from '../../store/useSessionStore'

const OPTIONS = [
  { value: null,     label: 'Auto-detect' },
  { value: 'php',    label: '🐘 PHP' },
  { value: 'nodejs', label: '⬢ Node.js' },
  { value: 'python', label: '🐍 Python' },
]

export default function FormatOverride() {
  const { formatOverride, setFormatOverride } = useSessionStore()

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-slate-400 shrink-0" htmlFor="format-override-select">
        Format override
      </label>
      <select
        id="format-override-select"
        value={formatOverride ?? ''}
        onChange={(e) => setFormatOverride(e.target.value || null)}
        className="input py-1.5 text-xs max-w-[160px]"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value ?? 'auto'} value={opt.value ?? ''}>
            {opt.label}
          </option>
        ))}
      </select>
      {formatOverride && (
        <button
          id="clear-format-override-btn"
          onClick={() => setFormatOverride(null)}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          ✕ Reset
        </button>
      )}
    </div>
  )
}

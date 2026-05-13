import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, availableValues }) {
  const { severity, language, search } = filters;

  const SEVERITIES = ['critical', 'high', 'medium', 'low'];
  const LANGUAGES = availableValues.languages || [];

  const toggleSeverity = (s) => {
    const newSeverity = severity.includes(s)
      ? severity.filter(item => item !== s)
      : [...severity, s];
    setFilters({ ...filters, severity: newSeverity });
  };

  const toggleLanguage = (l) => {
    const newLanguage = language.includes(l)
      ? language.filter(item => item !== l)
      : [...language, l];
    setFilters({ ...filters, language: newLanguage });
  };

  const clearFilters = () => {
    setFilters({ severity: [], language: [], search: '' });
  };

  const hasActiveFilters = severity.length > 0 || language.length > 0 || search !== '';

  return (
    <div className="card p-5 space-y-8 h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Filter size={16} className="text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Search Keywords</label>
        <input 
          type="text"
          value={search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Error message, file..."
          className="input w-full py-2 text-xs"
        />
      </div>

      {/* Severity */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Severity</label>
        <div className="grid grid-cols-2 gap-2">
          {SEVERITIES.map(s => (
            <button
              key={s}
              onClick={() => toggleSeverity(s)}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                severity.includes(s)
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-transparent text-slate-500 hover:border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Language / Format</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l}
              onClick={() => toggleLanguage(l)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all ${
                language.includes(l)
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-transparent text-slate-500 hover:border-white/10'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] text-slate-600 leading-relaxed italic">
          * Filters are applied in real-time to the dashboard and exports.
        </p>
      </div>
    </div>
  );
}

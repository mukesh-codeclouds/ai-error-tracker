import React from 'react';
import useAIStore from '../../store/useAIStore';

const ModelSelector = () => {
  const { provider, setProvider, models, setModel } = useAIStore();

  const providerOptions = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
    { id: 'google', name: 'Google Gemini', models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'] },
    { id: 'ollama', name: 'Ollama (Local)', models: ['llama3', 'mistral', 'codellama', 'phi3'] },
  ];

  const currentProvider = providerOptions.find(p => p.id === provider);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
      <div className="space-y-1 flex-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          AI Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          {providerOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 flex-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Model
        </label>
        <select
          value={models[provider]}
          onChange={(e) => setModel(provider, e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          {currentProvider?.models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ModelSelector;

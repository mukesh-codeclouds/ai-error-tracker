import React, { useState } from 'react';
import useAIStore from '../../store/useAIStore';

const ApiKeyInput = () => {
  const { apiKeys, setApiKey, provider, ollamaEndpoint, setOllamaEndpoint } = useAIStore();
  const [showKey, setShowKey] = useState(false);

  const providers = [
    { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
    { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
    { id: 'google', name: 'Google Gemini', placeholder: 'Enter API Key' },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h3>
        <button
          onClick={() => setShowKey(!showKey)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {showKey ? 'Hide Keys' : 'Show Keys'}
        </button>
      </div>

      <div className="grid gap-4">
        {providers.map((p) => (
          <div key={p.id} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {p.name} API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeys[p.id]}
                onChange={(e) => setApiKey(p.id, e.target.value)}
                placeholder={p.placeholder}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white font-mono text-sm"
              />
              {apiKeys[p.id] && !showKey && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ollama Endpoint (Local)
          </label>
          <input
            type="text"
            value={ollamaEndpoint}
            onChange={(e) => setOllamaEndpoint(e.target.value)}
            placeholder="http://localhost:11434"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
        * Keys are stored locally in your browser and never sent to our backend.
      </p>
    </div>
  );
};

export default ApiKeyInput;

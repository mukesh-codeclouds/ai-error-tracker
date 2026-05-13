import React from 'react';
import ApiKeyInput from '../components/ai/ApiKeyInput';
import ModelSelector from '../components/ai/ModelSelector';
import { Settings, Cpu, ShieldCheck, Trash2 } from 'lucide-react';
import useSessionStore from '../store/useSessionStore';
import useCodebaseStore from '../store/useCodebaseStore';
import { del } from 'idb-keyval';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Settings className="text-blue-600 dark:text-blue-400" size={28} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Model Configuration</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose your preferred AI provider and model for error mapping and fix suggestions.
        </p>
        <ModelSelector />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-green-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">API Keys & Security</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your keys are stored securely in your browser's local storage. They are never sent to our backend or any third party other than the selected provider.
        </p>
        <ApiKeyInput />
      </section>

      <section className="space-y-4 pt-8 border-t border-red-500/10">
        <div className="flex items-center gap-2">
          <Trash2 className="text-red-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Data Privacy & Purge</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Want to start fresh? This will permanently delete all session data, connected codebase handles, and saved AI API keys from your browser.
        </p>
        <button 
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
              await del('codebase_handle');
              useSessionStore.getState().clearSession();
              useCodebaseStore.getState().disconnect();
              localStorage.removeItem('ai-config-storage');
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition-all border border-red-500/20"
        >
          <Trash2 size={16} />
          Purge All Application Data
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;

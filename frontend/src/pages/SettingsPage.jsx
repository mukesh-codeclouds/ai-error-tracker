import React from 'react';
import ApiKeyInput from '../components/ai/ApiKeyInput';
import ModelSelector from '../components/ai/ModelSelector';
import { Settings, Cpu, ShieldCheck } from 'lucide-react';

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
    </div>
  );
};

export default SettingsPage;

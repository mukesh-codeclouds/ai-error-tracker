import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAIStore = create(
  persist(
    (set) => ({
      provider: 'openai', // openai, anthropic, google, ollama
      models: {
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20240620',
        google: 'gemini-1.5-pro',
        ollama: 'llama3',
      },
      apiKeys: {
        openai: '',
        anthropic: '',
        google: '',
      },
      ollamaEndpoint: 'http://localhost:11434',
      
      setProvider: (provider) => set({ provider }),
      
      setModel: (provider, model) => 
        set((state) => ({ 
          models: { ...state.models, [provider]: model } 
        })),
        
      setApiKey: (provider, key) => 
        set((state) => ({ 
          apiKeys: { ...state.apiKeys, [provider]: key } 
        })),
        
      setOllamaEndpoint: (endpoint) => set({ ollamaEndpoint: endpoint }),
    }),
    {
      name: 'ai-config-storage',
    }
  )
);

export default useAIStore;

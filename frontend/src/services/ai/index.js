import { openAIService } from './openai.service';
import { googleService } from './google.service';
import { anthropicService } from './anthropic.service';
import { ollamaService } from './ollama.service';

/**
 * AI Service Factory
 * Dispatches requests to the appropriate provider
 */
export const getAISuggestion = async (context, config) => {
  const { provider, apiKeys, models, ollamaEndpoint } = config;
  
  const payload = {
    model: models[provider],
    apiKey: apiKeys[provider],
    endpoint: ollamaEndpoint,
    context
  };

  switch (provider) {
    case 'openai':
      return await openAIService.generateFix(payload);
    case 'google':
      return await googleService.generateFix(payload);
    case 'anthropic':
      return await anthropicService.generateFix(payload);
    case 'ollama':
      return await ollamaService.generateFix(payload);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};

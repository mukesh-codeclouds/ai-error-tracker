import axios from 'axios';

export const anthropicService = {
  generateFix: async ({ model, apiKey, context }) => {
    if (!apiKey) throw new Error('Anthropic API Key is missing');

    const prompt = `
      You are an expert software debugger. Analyze the following error and provide a fix.
      Return your response in structured JSON format ONLY. No other text.
      
      JSON keys:
      {
        "explanation": "Brief root cause analysis",
        "fixSuggestion": "The corrected code or logical fix",
        "diff": {
          "oldValue": "The exact original code snippet that needs replacing",
          "newValue": "The new code snippet to replace the old one"
        },
        "confidence": 0.95
      }

      Error Context:
      - Message: ${context.message}
      - File: ${context.file}
      - Line: ${context.line}
      - Stack Trace: ${context.stackTrace || 'N/A'}
      
      Code Context around error:
      \`\`\`
      ${context.codeContext || 'N/A'}
      \`\`\`
    `;

    try {
      // Note: Anthropic might require a proxy or specific CORS handling if called directly from browser.
      // Usually better to use their SDK or a backend proxy, but following the "direct SDK/API" plan.
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model || 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
            'dangerouslyAllowBrowser': 'true' // Some environments might block this
          }
        }
      );

      const content = response.data.content[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Anthropic Service Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch from Anthropic');
    }
  }
};

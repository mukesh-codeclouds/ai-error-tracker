import axios from 'axios';

export const openAIService = {
  generateFix: async ({ model, apiKey, context }) => {
    if (!apiKey) throw new Error('OpenAI API Key is missing');

    const prompt = `
      You are an expert software debugger. Analyze the following error and provide a fix.
      
      Error Context:
      - Message: ${context.message}
      - File: ${context.file}
      - Line: ${context.line}
      - Stack Trace: ${context.stackTrace || 'N/A'}
      
      Code Context around error:
      \`\`\`
      ${context.codeContext || 'N/A'}
      \`\`\`

      Return your response in structured JSON format:
      {
        "explanation": "Brief root cause analysis",
        "fixSuggestion": "The corrected code or logical fix",
        "diff": {
          "oldValue": "The exact original code snippet that needs replacing",
          "newValue": "The new code snippet to replace the old one"
        },
        "confidence": 0.95
      }
    `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides debugging fixes in JSON format.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch from OpenAI');
    }
  }
};

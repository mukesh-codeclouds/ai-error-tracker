import axios from 'axios';

export const ollamaService = {
  generateFix: async ({ model, endpoint, context }) => {
    const prompt = `
      You are an expert software debugger. Analyze the following error and provide a fix.
      Return your response in structured JSON format. It must include the following keys:
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
      const response = await axios.post(
        `${endpoint || 'http://localhost:11434'}/api/generate`,
        {
          model: model || 'llama3',
          prompt: prompt,
          stream: false,
          format: 'json'
        }
      );

      return JSON.parse(response.data.response);
    } catch (error) {
      console.error('Ollama Service Error:', error);
      throw new Error('Failed to connect to local Ollama instance. Ensure it is running and CORS is configured.');
    }
  }
};

import axios from 'axios';

export const googleService = {
  generateFix: async ({ model, apiKey, context }) => {
    if (!apiKey) throw new Error('Google API Key is missing');

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

    let resolveModel = model || 'gemini-2.5-flash';
    // Map deprecated 1.5-flash to 2.5-flash automatically for users with stale cached settings
    if (resolveModel.includes('1.5-flash') || resolveModel.includes('1.0-pro')) {
      resolveModel = 'gemini-2.5-flash';
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${resolveModel}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Google Gemini Service Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch from Google Gemini');
    }
  }
};

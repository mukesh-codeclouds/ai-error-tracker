import axios from 'axios';

export const googleService = {
  generateFix: async ({ model, apiKey, context }) => {
    if (!apiKey) throw new Error('Google API Key is missing');

    const prompt = `
      You are an expert software debugger. Analyze the following error and provide a fix.
      Return your response in structured JSON format with keys: explanation, fixSuggestion, diff, confidence.
      
      Error Context:
      - Message: ${context.message}
      - File: ${context.file}
      - Line: ${context.line}
      - Stack Trace: ${context.stackTrace || 'N/A'}
      
      Code Snippet around error:
      \`\`\`
      ${context.codeSnippet || 'N/A'}
      \`\`\`
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`,
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

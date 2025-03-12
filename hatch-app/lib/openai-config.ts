// OpenAI API key configuration
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  // Default model to use
  defaultModel: "gpt-4o",
  // Fallback model if the default is not available
  fallbackModel: "gpt-3.5-turbo",
}


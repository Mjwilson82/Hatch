import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const generateIdeaTags = async (ideaText: string): Promise<string[]> => {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate 3-5 relevant tags for the following idea. Return only the tags as a JSON array of strings: "${ideaText}"`,
      temperature: 0.7,
      maxTokens: 100,
    })

    // Parse the response as JSON
    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating tags:", error)
    return []
  }
}

export const generateCategory = async (ideaText: string): Promise<string> => {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Categorize the following idea into a single general category (like "Health", "Technology", "Education", etc.). Return only the category name: "${ideaText}"`,
      temperature: 0.3,
      maxTokens: 20,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating category:", error)
    return "Uncategorized"
  }
}

export const streamNurturingChat = async (ideaText: string, userMessage: string, onChunk: (chunk: string) => void) => {
  try {
    const systemPrompt = `You are an AI assistant helping users develop their ideas. 
    The user has the following idea: "${ideaText}". 
    Your goal is to help them refine this idea, ask relevant questions, and provide guidance.
    Be concise, helpful, and focus on practical next steps.`

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userMessage,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          onChunk(chunk.text)
        }
      },
    })

    return result
  } catch (error) {
    console.error("Error in nurturing chat:", error)
    throw error
  }
}

export const generateOutput = async (
  ideaText: string,
  format: "checklist" | "guide" | "prd",
  additionalContext: string,
): Promise<string> => {
  try {
    let prompt = `Generate a detailed ${format} for the following idea: "${ideaText}". `

    if (additionalContext) {
      prompt += `Additional context from the user: ${additionalContext}. `
    }

    if (format === "checklist") {
      prompt += "Format as a markdown checklist with main categories and specific tasks under each."
    } else if (format === "guide") {
      prompt += "Format as a markdown guide with introduction, steps, and conclusion."
    } else if (format === "prd") {
      prompt +=
        "Format as a markdown PRD with problem statement, target audience, solution overview, features, and success metrics."
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return text
  } catch (error) {
    console.error("Error generating output:", error)
    throw error
  }
}


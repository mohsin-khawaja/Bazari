import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export interface CulturalContext {
  culture: string
  occasion: string
  style: string
  significance: string
  keywords: string[]
}

export async function analyzeCulturalContext(query: string): Promise<CulturalContext | null> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert in global ethnic fashion and cultural clothing. Analyze search queries to understand cultural context, occasions, and style preferences. Return a JSON object with:
      - culture: The cultural origin (e.g., "Pakistani", "Indian", "Korean", "African")
      - occasion: The event type (e.g., "wedding", "festival", "casual", "formal")
      - style: The style category (e.g., "traditional", "modern", "fusion")
      - significance: Brief cultural significance
      - keywords: Array of relevant search terms

      If the query doesn't relate to ethnic clothing, return null.`,
      prompt: `Analyze this search query for cultural clothing context: "${query}"`,
    })

    const result = JSON.parse(text)
    return result.culture ? result : null
  } catch (error) {
    console.error("Error analyzing cultural context:", error)
    return null
  }
}

export async function generateSearchSuggestions(query: string, userPreferences?: any): Promise<string[]> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `Generate 5 relevant search suggestions for ethnic clothing based on the user's query and preferences. Consider cultural variations, occasions, and style preferences. Return as a JSON array of strings.`,
      prompt: `Query: "${query}"
      User preferences: ${JSON.stringify(userPreferences || {})}
      
      Generate search suggestions:`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return []
  }
}

export async function enhanceSearchQuery(query: string, context?: CulturalContext): Promise<string> {
  if (!context) return query

  const enhancedTerms = [query, context.culture, context.occasion, ...context.keywords].filter(Boolean)

  return enhancedTerms.join(" ")
}

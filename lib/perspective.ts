/**
 * Google Perspective API integration for toxicity detection
 * 
 * This module provides functions to analyze text for toxicity using
 * Google's Perspective API. It checks messages before they are posted
 * to prevent harmful content.
 */

interface PerspectiveResponse {
  attributeScores: {
    [key: string]: {
      summaryScore: {
        value: number
        type: string
      }
      spanScores: Array<{
        begin: number
        end: number
        score: {
          value: number
          type: string
        }
      }>
    }
  }
  languages: string[]
  detectedLanguages: string[]
}

interface AnalyzeTextOptions {
  text: string
  threshold?: number // Toxicity threshold (0-1), default 0.7
  attributes?: string[] // Attributes to check, default ['TOXICITY']
}

/**
 * Analyzes text for toxicity using Google Perspective API
 * 
 * @param options - Analysis options
 * @returns Promise with toxicity score and whether text should be rejected
 */
export async function analyzeTextForToxicity({
  text,
  threshold = 0.7,
  attributes = ['TOXICITY'],
}: AnalyzeTextOptions): Promise<{
  isToxic: boolean
  toxicityScore: number
  error?: string
}> {
  const apiKey = process.env.GOOGLE_PERSPECTIVE_API_KEY

  if (!apiKey) {
    console.error('[Perspective] API key not configured')
    return {
      isToxic: false,
      toxicityScore: 0,
      error: 'Toxicity check service not configured',
    }
  }

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: {
            text: text,
          },
          requestedAttributes: Object.fromEntries(
            attributes.map((attr) => [attr, {}])
          ),
          languages: ['en'],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Perspective] API error:', response.status, errorData)
      return {
        isToxic: false,
        toxicityScore: 0,
        error: `Toxicity check failed: ${response.status}`,
      }
    }

    const data: PerspectiveResponse = await response.json()

    // Get the toxicity score (primary attribute)
    const toxicityAttribute = data.attributeScores['TOXICITY']
    const toxicityScore = toxicityAttribute?.summaryScore?.value ?? 0

    return {
      isToxic: toxicityScore >= threshold,
      toxicityScore,
    }
  } catch (error) {
    console.error('[Perspective] Error analyzing text:', error)
    return {
      isToxic: false,
      toxicityScore: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}


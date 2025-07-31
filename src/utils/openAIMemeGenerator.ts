// OpenAI-powered Meme Generator Integration
// This shows how to integrate the Meme Manager with OpenAI for intelligent meme creation

import { memeGenerator } from './memeGenerator';

interface OpenAIMemeRequest {
  prompt: string;
  template?: string;
  style?: 'classic' | 'modern' | 'edgy' | 'wholesome';
  context?: string;
}

interface OpenAIMemeResponse {
  text: string;
  confidence: number;
  template_used: string;
  positioning: Array<{ x: number; y: number; fontSize: number }>;
}

export class OpenAIMemeGenerator {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // In production, get this from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
  }

  async generateSmartMeme(request: OpenAIMemeRequest): Promise<OpenAIMemeResponse> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found, falling back to local generation');
      return this.fallbackGeneration(request);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request.style);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '';
      
      return this.parseAIResponse(aiResponse, request);
    } catch (error) {
      console.error('OpenAI generation failed:', error);
      return this.fallbackGeneration(request);
    }
  }

  private buildSystemPrompt(style: string = 'classic'): string {
    const basePrompt = `You are a meme text generator that creates funny, relatable text for internet memes. 
    
Your task is to generate meme text that is:
- Funny and relatable
- Appropriate for general audiences
- Uses internet meme conventions
- Fits common meme formats

Style: ${style}

Common meme formats include:
- Top text / Bottom text (classic)
- Drake pointing (rejecting/accepting)
- Nobody asked format
- Expanding brain (evolution of ideas)
- Change my mind
- Distracted boyfriend

Respond with just the meme text, using \\n for line breaks.`;

    return basePrompt;
  }

  private buildUserPrompt(request: OpenAIMemeRequest): string {
    let prompt = `Create meme text about: "${request.prompt}"`;
    
    if (request.template) {
      prompt += `\nUse the ${request.template} format.`;
    }
    
    if (request.context) {
      prompt += `\nContext: ${request.context}`;
    }
    
    prompt += `\n\nGenerate funny, appropriate meme text using standard internet meme conventions.`;
    
    return prompt;
  }

  private parseAIResponse(response: string, request: OpenAIMemeRequest): OpenAIMemeResponse {
    // Parse the AI response and determine positioning
    const lines = response.split('\n').filter(line => line.trim());
    const positioning = this.calculatePositioning(lines);
    
    return {
      text: response.trim(),
      confidence: 0.8, // Could be calculated based on response quality
      template_used: request.template || 'auto-detected',
      positioning,
    };
  }

  private calculatePositioning(lines: string[]): Array<{ x: number; y: number; fontSize: number }> {
    const positions = [];
    const lineCount = lines.length;
    
    for (let i = 0; i < lineCount; i++) {
      const yPosition = lineCount <= 2 
        ? (i === 0 ? 15 : 85) // Top/bottom for 2 lines
        : 15 + (i * (70 / (lineCount - 1))); // Distributed for more lines
      
      const fontSize = Math.max(24, 40 - (lineCount * 2));
      
      positions.push({
        x: 50,
        y: yPosition,
        fontSize,
      });
    }
    
    return positions;
  }

  private async fallbackGeneration(request: OpenAIMemeRequest): Promise<OpenAIMemeResponse> {
    const text = await memeGenerator.generateWithAI(request.prompt, request.template);
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      text,
      confidence: 0.6,
      template_used: 'fallback',
      positioning: this.calculatePositioning(lines),
    };
  }

  // Cost estimation for users
  static estimateCost(requestsPerMonth: number): number {
    // GPT-3.5-turbo pricing: ~$0.0015 per 1K tokens
    // Average meme generation: ~100 tokens
    const tokensPerRequest = 100;
    const costPer1KTokens = 0.0015;
    
    const totalTokens = (requestsPerMonth * tokensPerRequest) / 1000;
    return totalTokens * costPer1KTokens;
  }

  // Usage tracking for cost management
  static trackUsage(userId: string, tokensUsed: number) {
    // Implement usage tracking here
    console.log(`User ${userId} used ${tokensUsed} tokens`);
  }
}

// Example usage:
/*
const openAIMemeGen = new OpenAIMemeGenerator();

const result = await openAIMemeGen.generateSmartMeme({
  prompt: "trying to debug code at 3 AM",
  style: "classic",
  context: "programming humor"
});

console.log("Generated meme:", result.text);
console.log("Positioning:", result.positioning);
*/

export const openAIMemeGenerator = new OpenAIMemeGenerator();

// Option 3: Local AI using Transformers.js (runs in browser)
// No API keys needed, works offline, privacy-friendly

export class LocalAIAgent {
  private pipeline: any;
  private initialized = false;

  async initialize() {
    // Import transformers.js dynamically
    const { pipeline } = await import('@xenova/transformers');
    
    // Load a small conversational model
    this.pipeline = await pipeline('text-generation', 'microsoft/DialoGPT-small');
    this.initialized = true;
  }

  async generateResponse(userMessage: string, agentId: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Create context-aware prompt
      const prompt = this.buildPrompt(userMessage, agentId);
      
      // Generate response
      const result = await this.pipeline(prompt, {
        max_length: 150,
        num_return_sequences: 1,
        temperature: 0.8,
        do_sample: true
      });

      let response = result[0].generated_text;
      
      // Clean up and format response
      response = this.postProcessResponse(response, agentId);
      
      return response;
      
    } catch (error) {
      console.error('Local AI Error:', error);
      return this.getFallbackResponse(userMessage, agentId);
    }
  }

  private buildPrompt(userMessage: string, agentId: string): string {
    switch (agentId) {
      case 'SportsCenter90s':
        return `Sports Broadcaster: ${userMessage}
Response: THIS JUST IN:`;
        
      case 'FlunkBot':
        return `Campus Guide: ${userMessage}
Response: Yo!`;
        
      default:
        return `User: ${userMessage}
Assistant:`;
    }
  }

  private postProcessResponse(response: string, agentId: string): string {
    // Clean up the response and add personality
    let cleaned = response.split('Response:')[1]?.trim() || response;
    
    if (agentId === 'SportsCenter90s') {
      // Add sports broadcaster flair
      if (!cleaned.includes('THIS JUST IN') && !cleaned.includes('BOOYAH')) {
        cleaned = 'BOOYAH! ' + cleaned;
      }
      // Add emojis
      cleaned += ' 🏆📊';
    }
    
    return cleaned;
  }

  private getFallbackResponse(userMessage: string, agentId: string): string {
    // Smart fallback using pattern matching
    const message = userMessage.toLowerCase();
    
    if (agentId === 'SportsCenter90s') {
      if (message.includes('basketball')) {
        return "THIS JUST IN: Basketball talk! Jordan's 6 championships speak for themselves! 🏀🏆";
      } else if (message.includes('football')) {
        return "BOOYAH! Football fever! The 90s Cowboys were UNSTOPPABLE! 🏈⚡";
      } else {
        return "From the vault: The 90s sports scene was LEGENDARY! Ask me about any sport! 📊🔥";
      }
    }
    
    return "I'm still learning! Can you rephrase that?";
  }
}

// Usage
export const localAI = new LocalAIAgent();

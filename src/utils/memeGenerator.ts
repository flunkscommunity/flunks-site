// Enhanced AI-powered meme text generation
// This can be integrated with OpenAI API for more intelligent meme creation

interface MemeTemplate {
  name: string;
  pattern: string;
  positions: Array<{ x: number; y: number; fontSize?: number }>;
  description: string;
}

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    name: "Classic Top/Bottom",
    pattern: "{TOP_TEXT}\n\n{BOTTOM_TEXT}",
    positions: [
      { x: 50, y: 15, fontSize: 36 },
      { x: 50, y: 85, fontSize: 36 }
    ],
    description: "Traditional meme format with text at top and bottom"
  },
  {
    name: "Drake Pointing",
    pattern: "NO: {REJECT_TEXT}\n\nYES: {ACCEPT_TEXT}",
    positions: [
      { x: 80, y: 25, fontSize: 28 },
      { x: 80, y: 75, fontSize: 28 }
    ],
    description: "Drake pointing meme format"
  },
  {
    name: "Expanding Brain",
    pattern: "{LEVEL1}\n{LEVEL2}\n{LEVEL3}\n{LEVEL4}",
    positions: [
      { x: 70, y: 15, fontSize: 24 },
      { x: 70, y: 35, fontSize: 26 },
      { x: 70, y: 65, fontSize: 28 },
      { x: 70, y: 85, fontSize: 30 }
    ],
    description: "Expanding brain meme with increasing intelligence levels"
  },
  {
    name: "Nobody Asked",
    pattern: "NOBODY:\n\nLITERALLY NOBODY:\n\n{SUBJECT}: {ACTION}",
    positions: [
      { x: 50, y: 15, fontSize: 28 },
      { x: 50, y: 35, fontSize: 28 },
      { x: 50, y: 75, fontSize: 32 }
    ],
    description: "Nobody asked format for unsolicited opinions"
  },
  {
    name: "Change My Mind",
    pattern: "{CONTROVERSIAL_STATEMENT}\n\nCHANGE MY MIND",
    positions: [
      { x: 50, y: 20, fontSize: 34 },
      { x: 50, y: 80, fontSize: 28 }
    ],
    description: "Steven Crowder change my mind format"
  },
  {
    name: "Distracted Boyfriend",
    pattern: "{GIRLFRIEND}: {OLD_THING}\n{BOYFRIEND}: ME\n{OTHER_WOMAN}: {NEW_THING}",
    positions: [
      { x: 20, y: 85, fontSize: 20 },
      { x: 50, y: 85, fontSize: 20 },
      { x: 80, y: 85, fontSize: 20 }
    ],
    description: "Distracted boyfriend meme template"
  }
];

export class MemeTextGenerator {
  private static instance: MemeTextGenerator;
  
  constructor() {}

  static getInstance(): MemeTextGenerator {
    if (!MemeTextGenerator.instance) {
      MemeTextGenerator.instance = new MemeTextGenerator();
    }
    return MemeTextGenerator.instance;
  }

  // Enhanced prompt processing for better meme generation
  processPrompt(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect context and suggest appropriate meme format
    if (lowerPrompt.includes('choice') || lowerPrompt.includes('prefer')) {
      return this.generateDrakeStyleMeme(prompt);
    }
    
    if (lowerPrompt.includes('nobody') || lowerPrompt.includes('unsolicited')) {
      return this.generateNobodyMeme(prompt);
    }
    
    if (lowerPrompt.includes('opinion') || lowerPrompt.includes('controversial')) {
      return this.generateChangeMyMindMeme(prompt);
    }
    
    if (lowerPrompt.includes('evolution') || lowerPrompt.includes('levels')) {
      return this.generateExpandingBrainMeme(prompt);
    }
    
    // Default to classic top/bottom format
    return this.generateClassicMeme(prompt);
  }

  private generateClassicMeme(prompt: string): string {
    const classics = [
      `WHEN ${prompt.toUpperCase()}`,
      `ONE DOES NOT SIMPLY\n${prompt.toUpperCase()}`,
      `I DON'T ALWAYS ${prompt.toUpperCase()}\nBUT WHEN I DO...`,
      `${prompt.toUpperCase()}\nTHAT'S THE MEME`,
      `TRYING TO EXPLAIN\n${prompt.toUpperCase()}`,
    ];
    return classics[Math.floor(Math.random() * classics.length)];
  }

  private generateDrakeStyleMeme(prompt: string): string {
    const parts = prompt.split(/\s+(?:vs|versus|or)\s+/i);
    if (parts.length >= 2) {
      return `${parts[0].trim().toUpperCase()}: 👎\n\n${parts[1].trim().toUpperCase()}: 👍`;
    }
    return `OLD WAY: 👎\n\n${prompt.toUpperCase()}: 👍`;
  }

  private generateNobodyMeme(prompt: string): string {
    return `NOBODY:\n\nLITERALLY NOBODY:\n\nME: ${prompt.toUpperCase()}`;
  }

  private generateChangeMyMindMeme(prompt: string): string {
    return `${prompt.toUpperCase()}\n\nCHANGE MY MIND`;
  }

  private generateExpandingBrainMeme(prompt: string): string {
    const words = prompt.split(' ');
    const levels = [
      words.slice(0, Math.ceil(words.length / 4)).join(' '),
      words.slice(0, Math.ceil(words.length / 2)).join(' '),
      words.slice(0, Math.ceil(words.length * 3 / 4)).join(' '),
      prompt
    ];
    
    return levels.map((level, i) => level.toUpperCase()).join('\n\n');
  }

  // Advanced AI-powered generation (requires OpenAI API key)
  async generateWithAI(prompt: string, template?: string): Promise<string> {
    // This would integrate with your OpenAI setup
    // For now, return enhanced prompt processing
    if (template) {
      return this.applyTemplate(prompt, template);
    }
    return this.processPrompt(prompt);
  }

  private applyTemplate(prompt: string, templateName: string): string {
    const template = MEME_TEMPLATES.find(t => t.name === templateName);
    if (!template) return this.processPrompt(prompt);
    
    // Simple template application - you can enhance this further
    return template.pattern
      .replace(/{TOP_TEXT}/g, prompt.toUpperCase())
      .replace(/{BOTTOM_TEXT}/g, "BOTTOM TEXT")
      .replace(/{SUBJECT}/g, "ME")
      .replace(/{ACTION}/g, prompt.toUpperCase())
      .replace(/{CONTROVERSIAL_STATEMENT}/g, prompt.toUpperCase())
      .replace(/{OLD_THING}/g, "OLD WAY")
      .replace(/{NEW_THING}/g, prompt.toUpperCase())
      .replace(/{REJECT_TEXT}/g, "NO")
      .replace(/{ACCEPT_TEXT}/g, prompt.toUpperCase());
  }

  // Get random meme inspiration
  getRandomMemeIdea(): string {
    const ideas = [
      "When you find a bug in production",
      "Trying to explain cryptocurrency to your parents",
      "Me vs. Monday morning",
      "Frontend vs. Backend developers",
      "When the code works on the first try",
      "Debugging at 3 AM",
      "When you forget to save your work",
      "Client requirements vs. reality",
      "When you use Stack Overflow",
      "Working from home expectations vs. reality"
    ];
    
    return ideas[Math.floor(Math.random() * ideas.length)];
  }
}

export const memeGenerator = MemeTextGenerator.getInstance();

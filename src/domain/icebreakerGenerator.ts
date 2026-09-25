export interface IcebreakerContext {
  sharedContextText?: string;
  sharedInterests?: string[];
  zone?: string;
  activityName?: string;
  circleTitle?: string;
  otherUserName?: string;
}

/**
 * Pure rule-based icebreaker suggestion generator (MSG-02).
 * Rule 2 & Blueprint: 2 to 3 concrete suggestions built from real shared context.
 * Strictly rule-based templates, NEVER artificial generic AI hallucinations.
 */
export class IcebreakerGenerator {
  static generateSuggestions(context: IcebreakerContext): string[] {
    const suggestions: string[] = [];
    const name = context.otherUserName || 'there';
    const zone = context.zone || 'the area';

    // 1. Interest-specific heuristics
    const interests = (context.sharedInterests || []).map((i) => i.toLowerCase());

    if (interests.some((i) => i.includes('photo') || i.includes('camera'))) {
      suggestions.push('What camera / film stock do you shoot with? 📷');
      suggestions.push(`Know any great photo spots around ${zone}?`);
    } else if (interests.some((i) => i.includes('badminton') || i.includes('tennis') || i.includes('padel'))) {
      suggestions.push('How often do you usually play during the week? 🏸');
      suggestions.push(`Any preferred courts near ${zone}?`);
    } else if (interests.some((i) => i.includes('board game') || i.includes('catan') || i.includes('chess'))) {
      suggestions.push('What are your top 3 favorite board games? 🎲');
      suggestions.push('Up for a strategy game session this weekend?');
    } else if (interests.some((i) => i.includes('f1') || i.includes('formula 1') || i.includes('racing'))) {
      suggestions.push('Which team / driver are you backing this season? 🏎️');
      suggestions.push('Planning to catch the upcoming GP screening?');
    } else if (interests.some((i) => i.includes('coffee') || i.includes('cafe'))) {
      suggestions.push(`What's your go-to artisan coffee spot in ${zone}? ☕`);
    } else if (interests.some((i) => i.includes('run') || i.includes('marathon') || i.includes('fitness'))) {
      suggestions.push(`Do you have a favorite morning running trail in ${zone}? 🏃`);
    }

    // 2. Activity / Circle specific heuristics
    if (context.activityName) {
      suggestions.push(`Excited for the upcoming ${context.activityName}!`);
    } else if (context.circleTitle) {
      suggestions.push(`Glad to connect through ${context.circleTitle}!`);
    }

    // 3. Fallback concrete neighborhood & connection prompts if needed
    if (suggestions.length < 3) {
      suggestions.push(`Hey ${name}! What got you into your favorite activities?`);
    }
    if (suggestions.length < 3 && context.zone) {
      suggestions.push(`How long have you been exploring around ${zone}?`);
    }
    if (suggestions.length < 3) {
      suggestions.push('Looking forward to joining our next group session together!');
    }

    // Return strictly 2 to 3 distinct chips
    return Array.from(new Set(suggestions)).slice(0, 3);
  }
}

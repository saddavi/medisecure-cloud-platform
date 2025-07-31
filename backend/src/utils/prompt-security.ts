/**
 * Prompt Security Utility for AI Symptom Checker
 * Prevents prompt injection attacks while preserving medical terminology
 */

export class PromptSecurity {
  /**
   * Sanitize user input to prevent prompt injection attacks
   * Focused on common attack patterns without over-engineering
   */
  static sanitizeSymptoms(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input.trim();
    
    // 1. Remove dangerous instruction patterns
    const dangerousPatterns = [
      /ignore.*(?:previous|above|prior).*instructions?/gi,
      /disregard.*instructions?/gi,
      /forget.*(?:previous|everything)/gi,
      /(?:new|override).*instructions?:/gi,
      /system\s*:/gi,
      /assistant\s*:/gi,
      /\bprompt\s*:/gi,
      /reveal.*(?:prompt|instructions?)/gi,
      /show.*(?:prompt|instructions?)/gi,
      /what.*your.*(?:prompt|instructions?)/gi,
      /repeat.*(?:prompt|instructions?)/gi,
      /\bdo\s+not\s+follow/gi,
      /\binstead\s+(?:do|follow)/gi,
    ];
    
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REMOVED]');
    });
    
    // 2. Escape special characters that could break prompt structure
    // But preserve medical punctuation like hyphens in "COVID-19"
    sanitized = sanitized
      .replace(/\\/g, '\\\\')           // Escape backslashes
      .replace(/"/g, '\\"')             // Escape quotes
      .replace(/`/g, '\\`')             // Escape backticks
      .replace(/\$/g, '\\$')            // Escape dollar signs
      .replace(/\{/g, '\\{')            // Escape curly braces
      .replace(/\}/g, '\\}')            // Escape curly braces
      .replace(/\n{3,}/g, '\n\n');      // Limit consecutive newlines
    
    // 3. Remove potential code injection attempts
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '[CODE REMOVED]');
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '[REMOVED]');
    
    // 4. Preserve Arabic text and medical terms
    // Only keep printable ASCII, Arabic, and common medical symbols
    sanitized = sanitized.replace(/[^\x20-\x7E\u0600-\u06FF\u0750-\u077F\s\-\.,'()°]/g, '');
    
    // 5. Final length check after sanitization
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    return sanitized;
  }
  
  /**
   * Check if input contains potential malicious patterns
   * Returns true if suspicious content detected
   */
  static detectMaliciousIntent(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    const suspiciousKeywords = [
      'jailbreak',
      'bypass',
      'exploit',
      'injection',
      'system prompt',
      'ignore instruction',
      'reveal prompt',
      'override',
      'backdoor',
      'escape',
    ];
    
    return suspiciousKeywords.some(keyword => lowerInput.includes(keyword));
  }
  
  /**
   * Create a safe prompt structure with delimiters
   * This prevents the AI from treating user input as instructions
   */
  static wrapWithDelimiters(userInput: string): string {
    const delimiter = "####";
    return `${delimiter}\n${userInput}\n${delimiter}`;
  }
}
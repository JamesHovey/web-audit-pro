/**
 * Comprehensive Business Keyword Collections
 * Pre-built keyword patterns for different business types
 */

export interface BusinessKeywordCollection {
  category: string;
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  patterns: string[];
  modifiers: string[];
  longtailTemplates: string[];
}

export const BUSINESS_KEYWORD_COLLECTIONS: BusinessKeywordCollection[] = [
  // Financial Services & Trading
  {
    category: 'financial-services',
    intent: 'commercial',
    patterns: [
      'investment management', 'portfolio management', 'wealth management',
      'financial advisor', 'investment advisor', 'financial planning',
      'asset management', 'fund management', 'private equity',
      'hedge fund', 'mutual fund', 'index fund',
      'trading platform', 'trading software', 'algorithmic trading',
      'forex trading', 'stock trading', 'options trading',
      'retirement planning', 'pension advice', 'tax planning',
      'risk management', 'compliance services', 'regulatory advice'
    ],
    modifiers: ['best', 'top', 'professional', 'expert', 'certified', 'independent', 'local', 'near me'],
    longtailTemplates: [
      '{modifier} {pattern} services',
      '{pattern} for {target_audience}',
      'how to choose {pattern}',
      '{pattern} {location}',
      'cost of {pattern}',
      '{pattern} reviews'
    ]
  },

  // Legal Services
  {
    category: 'legal-services',
    intent: 'commercial',
    patterns: [
      'solicitor', 'lawyer', 'barrister', 'legal advice',
      'family law', 'divorce lawyer', 'child custody',
      'personal injury', 'medical negligence', 'accident claim',
      'employment law', 'unfair dismissal', 'workplace rights',
      'conveyancing', 'property law', 'commercial law',
      'will writing', 'probate', 'estate planning',
      'immigration law', 'visa application', 'citizenship advice'
    ],
    modifiers: ['experienced', 'specialist', 'qualified', 'local', 'affordable', 'no win no fee'],
    longtailTemplates: [
      '{modifier} {pattern} {location}',
      '{pattern} near me',
      'free consultation {pattern}',
      'how much does {pattern} cost',
      '{pattern} reviews and ratings'
    ]
  },

  // Healthcare & Medical
  {
    category: 'healthcare',
    intent: 'commercial',
    patterns: [
      'private healthcare', 'medical treatment', 'specialist doctor',
      'dental treatment', 'cosmetic dentistry', 'orthodontics',
      'physiotherapy', 'sports injury', 'rehabilitation',
      'mental health', 'counselling', 'therapy',
      'cosmetic surgery', 'plastic surgery', 'aesthetic treatment',
      'eye surgery', 'laser treatment', 'medical imaging'
    ],
    modifiers: ['private', 'NHS', 'expert', 'experienced', 'affordable', 'same day'],
    longtailTemplates: [
      '{modifier} {pattern} {location}',
      '{pattern} cost and prices',
      'book {pattern} appointment',
      '{pattern} waiting times',
      'best {pattern} near me'
    ]
  },

  // Architecture & Construction
  {
    category: 'architecture-construction',
    intent: 'commercial',
    patterns: [
      'architect', 'architectural design', 'building design',
      'house extension', 'loft conversion', 'kitchen extension',
      'planning permission', 'building regulations', 'structural engineer',
      'project management', 'construction management', 'quantity surveyor',
      'residential architect', 'commercial architect', 'interior design',
      'sustainable design', 'eco building', 'passive house'
    ],
    modifiers: ['experienced', 'RIBA', 'chartered', 'award winning', 'local', 'sustainable'],
    longtailTemplates: [
      '{modifier} {pattern} {location}',
      '{pattern} cost calculator',
      '{pattern} planning permission',
      'how to find {pattern}',
      '{pattern} portfolio examples'
    ]
  },

  // Digital Marketing & Technology
  {
    category: 'digital-marketing',
    intent: 'commercial',
    patterns: [
      'digital marketing', 'SEO services', 'PPC management',
      'social media marketing', 'content marketing', 'email marketing',
      'web design', 'website development', 'e-commerce',
      'branding', 'graphic design', 'logo design',
      'video production', 'photography', 'copywriting',
      'marketing strategy', 'brand strategy', 'growth hacking'
    ],
    modifiers: ['professional', 'affordable', 'expert', 'creative', 'data-driven', 'results-focused'],
    longtailTemplates: [
      '{modifier} {pattern} agency',
      '{pattern} services for {industry}',
      'freelance {pattern}',
      '{pattern} packages and pricing',
      'ROI from {pattern}'
    ]
  },

  // Manufacturing & Industrial
  {
    category: 'manufacturing',
    intent: 'commercial',
    patterns: [
      'manufacturing equipment', 'industrial machinery', 'production line',
      'quality control', 'lean manufacturing', 'automation',
      'CNC machining', 'injection molding', 'metal fabrication',
      'packaging machinery', 'conveyor systems', 'robotics',
      'maintenance services', 'equipment rental', 'spare parts',
      'certification services', 'testing equipment', 'calibration'
    ],
    modifiers: ['industrial', 'commercial', 'heavy duty', 'precision', 'automated', 'custom'],
    longtailTemplates: [
      '{modifier} {pattern} supplier',
      '{pattern} maintenance and repair',
      'buy vs lease {pattern}',
      '{pattern} specifications',
      'used {pattern} for sale'
    ]
  }
];

export const KEYWORD_INTENT_MODIFIERS = {
  commercial: ['buy', 'purchase', 'hire', 'book', 'order', 'get quote', 'price', 'cost'],
  informational: ['what is', 'how to', 'guide to', 'tips for', 'benefits of', 'types of'],
  navigational: ['login', 'contact', 'about', 'services', 'portfolio', 'reviews'],
  transactional: ['book now', 'buy online', 'free trial', 'get started', 'contact us', 'free quote']
};

export const LOCATION_MODIFIERS = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool',
  'Bristol', 'Sheffield', 'Newcastle', 'Cardiff', 'Belfast', 'Edinburgh',
  'UK', 'England', 'Scotland', 'Wales', 'Northern Ireland',
  'near me', 'local', 'in my area'
];

export const TARGET_AUDIENCES = [
  'small businesses', 'startups', 'SMEs', 'large enterprises',
  'individuals', 'families', 'professionals', 'entrepreneurs',
  'retirees', 'students', 'first time buyers', 'landlords'
];

/**
 * Generate keyword variations for a specific business category
 */
export function generateKeywordVariations(
  category: string, 
  location?: string, 
  audience?: string
): string[] {
  const collection = BUSINESS_KEYWORD_COLLECTIONS.find(c => c.category === category);
  if (!collection) return [];

  const variations: string[] = [];
  
  collection.patterns.forEach(pattern => {
    // Base pattern
    variations.push(pattern);
    
    // With modifiers
    collection.modifiers.forEach(modifier => {
      variations.push(`${modifier} ${pattern}`);
    });
    
    // With location
    if (location) {
      variations.push(`${pattern} ${location}`);
      variations.push(`${pattern} near ${location}`);
    }
    
    // With audience
    if (audience) {
      variations.push(`${pattern} for ${audience}`);
    }
    
    // Commercial intent
    KEYWORD_INTENT_MODIFIERS.commercial.forEach(intent => {
      variations.push(`${intent} ${pattern}`);
    });
    
    // Informational intent
    KEYWORD_INTENT_MODIFIERS.informational.forEach(intent => {
      variations.push(`${intent} ${pattern}`);
    });
  });
  
  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Match extracted keywords against business patterns
 */
export function matchBusinessPatterns(
  extractedKeywords: string[], 
  businessCategory: string
): Array<{keyword: string, pattern: string, intent: string, confidence: number}> {
  const collection = BUSINESS_KEYWORD_COLLECTIONS.find(c => c.category === businessCategory);
  if (!collection) return [];
  
  const matches: Array<{keyword: string, pattern: string, intent: string, confidence: number}> = [];
  
  extractedKeywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    
    collection.patterns.forEach(pattern => {
      const lowerPattern = pattern.toLowerCase();
      
      // Exact match
      if (lowerKeyword === lowerPattern) {
        matches.push({
          keyword,
          pattern,
          intent: collection.intent,
          confidence: 1.0
        });
      }
      // Partial match
      else if (lowerKeyword.includes(lowerPattern) || lowerPattern.includes(lowerKeyword)) {
        const confidence = Math.max(
          lowerKeyword.length / lowerPattern.length,
          lowerPattern.length / lowerKeyword.length
        ) * 0.8;
        
        if (confidence > 0.6) {
          matches.push({
            keyword,
            pattern,
            intent: collection.intent,
            confidence
          });
        }
      }
    });
  });
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
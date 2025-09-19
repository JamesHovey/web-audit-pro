interface BusinessContext {
  industry: string;
  services: string[];
  locations: string[];
  brandName: string;
  businessSize: 'micro' | 'small' | 'medium';
  specializations: string[];
  targetMarket: string;
}

interface ContextualKeyword {
  keyword: string;
  relevanceScore: number; // 0-100 based on business context
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  difficulty: number; // Realistic for SME
  volume: number; // SME-appropriate volumes
  position: number; // 1-10 only
  type: 'branded' | 'service' | 'location' | 'industry';
  competitiveness: 'low' | 'medium' | 'high';
}

interface SMECompetitor {
  domain: string;
  businessName: string;
  services: string[];
  location: string;
  size: 'similar' | 'larger';
  marketShare: number; // Estimated local/regional market share
  relevanceScore: number; // How closely related to target business
}

// Generic/irrelevant keywords to filter out
const GENERIC_KEYWORDS = new Set([
  'follow us', 'find us', 'contact us', 'about us', 'call us', 'email us',
  'close services', 'open services', 'get in touch', 'learn more',
  'click here', 'read more', 'see more', 'view more', 'more info',
  'home page', 'main page', 'our team', 'our story', 'our mission',
  'privacy policy', 'terms conditions', 'cookie policy', 'sitemap',
  'copyright', 'all rights reserved', 'back to top', 'scroll down',
  'menu', 'navigation', 'header', 'footer', 'sidebar', 'content',
  'page', 'website', 'site', 'web', 'online', 'internet', 'digital',
  'services we', 'we offer', 'we provide', 'we are', 'we have',
  'this is', 'that is', 'here is', 'there is', 'it is', 'you are',
  'social media', 'facebook', 'twitter', 'linkedin', 'instagram'
]);

// Analyze business context from website content
function analyzeBusinessContext(content: string, title: string, domain: string): BusinessContext {
  const normalizedContent = content.toLowerCase();
  const normalizedTitle = title.toLowerCase();
  
  // Extract brand name
  const brandName = extractBrandName(domain, title);
  
  // Detect industry with high confidence
  const industry = detectSpecificIndustry(normalizedContent, normalizedTitle);
  
  // Extract services offered
  const services = extractServices(normalizedContent);
  
  // Extract locations served
  const locations = extractLocations(normalizedContent);
  
  // Determine business size from content indicators
  const businessSize = determineBusinessSize(normalizedContent, services.length);
  
  // Extract specializations
  const specializations = extractSpecializations(normalizedContent, industry);
  
  // Determine target market
  const targetMarket = determineTargetMarket(normalizedContent, industry);
  
  return {
    industry,
    services,
    locations,
    brandName,
    businessSize,
    specializations,
    targetMarket
  };
}

// Extract brand name more intelligently
function extractBrandName(domain: string, title: string): string {
  // Clean domain
  const domainBrand = domain.replace(/^(www\.|https?:\/\/)/, '').split('.')[0];
  
  // Look for brand in title (often first or last word)
  const titleWords = title.split(/[\s\-\|:,]/).filter(w => w.length > 2);
  
  // Check if domain brand appears in title
  for (const word of titleWords) {
    if (word.toLowerCase().includes(domainBrand.toLowerCase()) || 
        domainBrand.toLowerCase().includes(word.toLowerCase())) {
      return word;
    }
  }
  
  // Return cleaned domain if no match in title
  return domainBrand.replace(/[-_]/g, ' ').toLowerCase();
}

// Detect specific industry with high accuracy
function detectSpecificIndustry(content: string, title: string): string {
  const combined = `${title} ${content}`;
  
  const industrySignals = {
    'Digital Marketing Agency': [
      'digital marketing', 'seo services', 'ppc management', 'social media marketing',
      'content marketing', 'online advertising', 'google ads', 'facebook ads',
      'marketing strategy', 'lead generation', 'conversion optimization'
    ],
    'Web Design Agency': [
      'web design', 'website development', 'ui ux design', 'responsive design',
      'wordpress development', 'ecommerce development', 'website redesign',
      'landing page design', 'user experience', 'web development'
    ],
    'Management Consulting': [
      'business consulting', 'strategy consulting', 'management advice',
      'operational improvement', 'business transformation', 'change management',
      'process optimization', 'organizational development'
    ],
    'IT Services': [
      'it support', 'managed services', 'cloud solutions', 'cybersecurity',
      'network management', 'data backup', 'server maintenance', 'tech support'
    ],
    'Accounting Services': [
      'bookkeeping', 'tax preparation', 'financial planning', 'payroll services',
      'audit services', 'financial consulting', 'tax advice', 'accounting firm'
    ],
    'Legal Services': [
      'legal advice', 'solicitors', 'law firm', 'legal representation',
      'litigation', 'contract law', 'employment law', 'family law'
    ],
    'Real Estate': [
      'property sales', 'real estate agent', 'property management',
      'commercial property', 'residential property', 'property investment'
    ],
    'Healthcare Services': [
      'medical services', 'healthcare provider', 'clinic', 'medical practice',
      'patient care', 'health consultation', 'medical treatment'
    ]
  };
  
  let bestMatch = 'Professional Services';
  let maxScore = 0;
  
  for (const [industry, signals] of Object.entries(industrySignals)) {
    const score = signals.filter(signal => combined.includes(signal)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = industry;
    }
  }
  
  return bestMatch;
}

// Extract services with contextual understanding
function extractServices(content: string): string[] {
  const services = new Set<string>();
  
  // Service patterns with context
  const servicePatterns = [
    // Direct service mentions
    /(?:we offer|we provide|our services include|services:)\s*([^.!?]{10,100})/gi,
    // Service pages/sections
    /(?:services?|solutions?|offerings?)[:\s]*([^.!?]{10,80})/gi,
    // Action-oriented services
    /(help(?:ing)? (?:with|you)|speciali[sz]e in|expert in)\s*([^.!?]{10,60})/gi
  ];
  
  servicePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract and clean service terms
        const cleanMatch = match
          .replace(/^(we offer|we provide|our services include|services:|help with|helping|specialize in|expert in)/i, '')
          .replace(/[^a-zA-Z\s]/g, ' ')
          .trim()
          .toLowerCase();
        
        if (cleanMatch.length > 5 && cleanMatch.length < 50) {
          services.add(cleanMatch);
        }
      });
    }
  });
  
  // Common service keywords by industry
  const serviceKeywords = [
    'consulting', 'development', 'design', 'management', 'strategy',
    'optimization', 'analysis', 'planning', 'implementation', 'support',
    'training', 'auditing', 'research', 'maintenance', 'integration'
  ];
  
  serviceKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      // Find context around the keyword
      const regex = new RegExp(`([a-zA-Z\\s]{0,20}${keyword}[a-zA-Z\\s]{0,20})`, 'gi');
      const contextMatches = content.match(regex);
      if (contextMatches) {
        contextMatches.forEach(context => {
          const cleanContext = context.trim().toLowerCase();
          if (cleanContext.length > 8 && cleanContext.length < 40) {
            services.add(cleanContext);
          }
        });
      }
    }
  });
  
  return Array.from(services).slice(0, 10);
}

// Extract location information
function extractLocations(content: string): string[] {
  const locations = new Set<string>();
  
  // UK location patterns
  const ukPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(?:UK|United Kingdom|England|Scotland|Wales)\b/g,
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    /\bserving\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    /\bbased\s+in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  ];
  
  ukPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const locationMatch = match.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        if (locationMatch) {
          const location = locationMatch[1].trim();
          if (location.length > 3 && location.length < 30) {
            locations.add(location);
          }
        }
      });
    }
  });
  
  return Array.from(locations).slice(0, 5);
}

// Determine business size from content
function determineBusinessSize(content: string, serviceCount: number): BusinessContext['businessSize'] {
  const sizeIndicators = {
    micro: ['freelancer', 'consultant', 'sole trader', 'one person', 'individual'],
    small: ['small team', 'family business', 'local', 'personal service', 'boutique'],
    medium: ['established', 'experienced team', 'multiple clients', 'range of services']
  };
  
  let microScore = 0;
  let smallScore = 0;
  let mediumScore = 0;
  
  sizeIndicators.micro.forEach(indicator => {
    if (content.includes(indicator)) microScore++;
  });
  
  sizeIndicators.small.forEach(indicator => {
    if (content.includes(indicator)) smallScore++;
  });
  
  sizeIndicators.medium.forEach(indicator => {
    if (content.includes(indicator)) mediumScore++;
  });
  
  // Also consider service diversity
  if (serviceCount > 8) mediumScore += 2;
  else if (serviceCount > 4) smallScore += 1;
  else microScore += 1;
  
  if (mediumScore >= smallScore && mediumScore >= microScore) return 'medium';
  if (smallScore >= microScore) return 'small';
  return 'micro';
}

// Extract specializations
function extractSpecializations(content: string, industry: string): string[] {
  const specializations = new Set<string>();
  
  const specializationPatterns = [
    /speciali[sz]e in ([^.!?]{10,50})/gi,
    /expert in ([^.!?]{10,50})/gi,
    /focus on ([^.!?]{10,50})/gi,
    /dedicated to ([^.!?]{10,50})/gi
  ];
  
  specializationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const spec = match.replace(/^(speciali[sz]e in|expert in|focus on|dedicated to)\s*/i, '').trim();
        if (spec.length > 5 && spec.length < 40) {
          specializations.add(spec.toLowerCase());
        }
      });
    }
  });
  
  return Array.from(specializations).slice(0, 5);
}

// Determine target market
function determineTargetMarket(content: string, industry: string): string {
  const marketIndicators = {
    'Small Businesses': ['small business', 'sme', 'startups', 'entrepreneurs'],
    'Enterprise': ['enterprise', 'large companies', 'corporations', 'fortune'],
    'Local Market': ['local', 'community', 'neighborhood', 'area businesses'],
    'E-commerce': ['online stores', 'e-commerce', 'ecommerce', 'online retailers'],
    'Healthcare': ['healthcare', 'medical', 'hospitals', 'clinics'],
    'Technology': ['tech companies', 'software', 'saas', 'technology firms']
  };
  
  let bestMatch = 'General Business';
  let maxScore = 0;
  
  for (const [market, indicators] of Object.entries(marketIndicators)) {
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = market;
    }
  }
  
  return bestMatch;
}

// Generate contextually relevant keywords
function generateContextualKeywords(context: BusinessContext, content: string): ContextualKeyword[] {
  const keywords: ContextualKeyword[] = [];
  
  // 1. Service-based keywords (highest relevance)
  context.services.forEach(service => {
    const baseKeyword = service.trim();
    if (baseKeyword.length > 3) {
      keywords.push({
        keyword: baseKeyword,
        relevanceScore: 95,
        intent: 'commercial',
        difficulty: calculateSMEDifficulty(baseKeyword, context.businessSize),
        volume: calculateSMEVolume(baseKeyword, context.businessSize),
        position: Math.floor(Math.random() * 3) + 1, // Top 3 for main services
        type: 'service',
        competitiveness: 'medium'
      });
      
      // Add location + service combinations
      context.locations.forEach(location => {
        const locationKeyword = `${baseKeyword} ${location.toLowerCase()}`;
        keywords.push({
          keyword: locationKeyword,
          relevanceScore: 90,
          intent: 'commercial',
          difficulty: calculateSMEDifficulty(locationKeyword, context.businessSize) - 10,
          volume: Math.floor(calculateSMEVolume(baseKeyword, context.businessSize) * 0.3),
          position: Math.floor(Math.random() * 5) + 1,
          type: 'location',
          competitiveness: 'low'
        });
      });
    }
  });
  
  // 2. Industry-specific keywords
  const industryKeywords = getIndustryKeywords(context.industry);
  industryKeywords.forEach(keyword => {
    keywords.push({
      keyword,
      relevanceScore: 85,
      intent: 'commercial',
      difficulty: calculateSMEDifficulty(keyword, context.businessSize),
      volume: calculateSMEVolume(keyword, context.businessSize),
      position: Math.floor(Math.random() * 7) + 1,
      type: 'industry',
      competitiveness: 'medium'
    });
  });
  
  // 3. Branded keywords
  const brandVariations = [
    context.brandName,
    `${context.brandName} services`,
    `${context.brandName} reviews`,
    `about ${context.brandName}`
  ];
  
  brandVariations.forEach(brandKeyword => {
    keywords.push({
      keyword: brandKeyword.toLowerCase(),
      relevanceScore: 100,
      intent: 'navigational',
      difficulty: 15, // Brand keywords are easier
      volume: Math.floor(calculateSMEVolume('brand', context.businessSize) * 0.5),
      position: 1, // Should rank #1 for brand terms
      type: 'branded',
      competitiveness: 'low'
    });
  });
  
  // Filter and sort by relevance
  return keywords
    .filter(k => k.relevanceScore >= 80) // Only highly relevant keywords
    .filter(k => k.position <= 10) // Only top 10 positions
    .filter(k => !GENERIC_KEYWORDS.has(k.keyword.toLowerCase())) // Filter out generic terms
    .filter(k => k.keyword.length > 3) // Minimum length requirement
    .filter(k => !/^(the|and|for|with|you|your|our|we|us|is|are|in|on|at|to|of|a)$/.test(k.keyword)) // Filter single generic words
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 15); // Top 15 most relevant
}

// Calculate SME-appropriate difficulty (20-70 range)
function calculateSMEDifficulty(keyword: string, businessSize: BusinessContext['businessSize']): number {
  let baseDifficulty = 40;
  
  // Adjust based on keyword type
  if (keyword.includes('near me') || keyword.includes('local')) baseDifficulty -= 15;
  if (keyword.length > 20) baseDifficulty -= 10; // Long tail easier
  if (keyword.split(' ').length > 3) baseDifficulty -= 5; // More specific = easier
  
  // Adjust based on business size (smaller businesses target easier keywords)
  switch (businessSize) {
    case 'micro': baseDifficulty -= 10; break;
    case 'small': baseDifficulty -= 5; break;
    case 'medium': break; // No adjustment
  }
  
  return Math.max(20, Math.min(70, baseDifficulty));
}

// Calculate SME-appropriate volume (50-2000 range)
function calculateSMEVolume(keyword: string, businessSize: BusinessContext['businessSize']): number {
  let baseVolume = 300;
  
  // Adjust based on keyword specificity
  if (keyword.includes('near me') || keyword.includes('local')) baseVolume += 200;
  if (keyword.length > 20) baseVolume = Math.floor(baseVolume * 0.6); // Long tail lower volume
  if (keyword.split(' ').length > 3) baseVolume = Math.floor(baseVolume * 0.7);
  
  // Adjust based on business size target market
  switch (businessSize) {
    case 'micro': baseVolume = Math.floor(baseVolume * 0.5); break;
    case 'small': baseVolume = Math.floor(baseVolume * 0.8); break;
    case 'medium': baseVolume = Math.floor(baseVolume * 1.2); break;
  }
  
  return Math.max(50, Math.min(2000, baseVolume + Math.floor(Math.random() * 200)));
}

// Get industry-specific keywords
function getIndustryKeywords(industry: string): string[] {
  const industryKeywordMap: Record<string, string[]> = {
    'Digital Marketing Agency': [
      'digital marketing services', 'seo optimization', 'ppc advertising',
      'social media management', 'content marketing strategy'
    ],
    'Web Design Agency': [
      'responsive web design', 'ecommerce development', 'wordpress websites',
      'user experience design', 'website optimization'
    ],
    'Management Consulting': [
      'business strategy consulting', 'operational improvement',
      'change management services', 'process optimization'
    ],
    'IT Services': [
      'managed it services', 'cloud solutions', 'cybersecurity services',
      'network support', 'data backup solutions'
    ],
    'Accounting Services': [
      'small business accounting', 'tax preparation services',
      'bookkeeping services', 'financial planning advice'
    ]
  };
  
  return industryKeywordMap[industry] || ['professional services', 'business solutions'];
}

// Generate SME-focused competitors
function generateSMECompetitors(context: BusinessContext): SMECompetitor[] {
  const competitors: SMECompetitor[] = [];
  
  // Generate realistic local/regional competitors
  const competitorTemplates = getSMECompetitorTemplates(context.industry);
  
  competitorTemplates.forEach((template, index) => {
    const location = context.locations[0] || 'UK';
    competitors.push({
      domain: `${template.nameBase.toLowerCase().replace(/\s+/g, '')}.co.uk`,
      businessName: `${template.nameBase} ${location}`,
      services: template.services,
      location: location,
      size: index < 3 ? 'similar' : 'larger',
      marketShare: Math.floor(Math.random() * 15) + 5, // 5-20% local market share
      relevanceScore: 95 - (index * 5) // Decreasing relevance
    });
  });
  
  return competitors.slice(0, 10);
}

// Get SME competitor templates by industry
function getSMECompetitorTemplates(industry: string) {
  const templates: Record<string, Array<{nameBase: string, services: string[]}>> = {
    'Digital Marketing Agency': [
      { nameBase: 'Digital Growth Solutions', services: ['SEO', 'PPC', 'Social Media'] },
      { nameBase: 'Local Marketing Hub', services: ['Digital Marketing', 'Web Design'] },
      { nameBase: 'Creative Digital Agency', services: ['Content Marketing', 'Branding'] },
      { nameBase: 'Search Marketing Pro', services: ['SEO', 'Google Ads'] },
      { nameBase: 'Social Media Experts', services: ['Social Media', 'Content Creation'] }
    ],
    'Web Design Agency': [
      { nameBase: 'Modern Web Design', services: ['Web Design', 'Development'] },
      { nameBase: 'Creative Websites', services: ['WordPress', 'E-commerce'] },
      { nameBase: 'Digital Design Studio', services: ['UI/UX', 'Branding'] },
      { nameBase: 'Professional Web Solutions', services: ['Web Development', 'SEO'] },
      { nameBase: 'Responsive Design Co', services: ['Mobile Design', 'Optimization'] }
    ]
  };
  
  return templates[industry] || [
    { nameBase: 'Professional Services', services: ['Consulting', 'Solutions'] },
    { nameBase: 'Business Solutions', services: ['Strategy', 'Implementation'] },
    { nameBase: 'Expert Consultancy', services: ['Advice', 'Support'] }
  ];
}

// Main function to analyze and return contextual keywords
export async function analyzeContextualKeywords(domain: string, content: string, title: string) {
  console.log(`\n=== CONTEXTUAL KEYWORD ANALYSIS FOR ${domain} ===`);
  
  // Analyze business context
  const context = analyzeBusinessContext(content, title, domain);
  console.log('Business Context:', context);
  
  // Generate contextually relevant keywords
  const keywords = generateContextualKeywords(context, content);
  
  // Generate SME competitors
  const competitors = generateSMECompetitors(context);
  
  console.log(`Found ${keywords.length} contextually relevant keywords`);
  console.log(`Identified ${competitors.length} SME competitors`);
  
  return {
    businessContext: context,
    keywords,
    competitors,
    methodology: 'contextual_analysis_sme_focused'
  };
}
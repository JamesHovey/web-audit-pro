interface ExtractedKeyword {
  keyword: string;
  count: number;
  prominence: number; // 0-100 score based on placement
  isAboveFold: boolean;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational' | 'mixed';
  type: 'branded' | 'non-branded';
}

interface KeywordMetrics {
  brandedKeywords: number;
  nonBrandedKeywords: number;
  aboveFoldKeywords: number;
  totalKeywords: number;
  intentDistribution: {
    informational: number;
    commercial: number;
    transactional: number;
    navigational: number;
  };
  topKeywords: ExtractedKeyword[];
  brandName: string;
  competitors: CompetitorSite[];
  businessContext?: {
    industry: string;
    services: string[];
    locations: string[];
    brandName: string;
    businessSize: string;
    specializations: string[];
    targetMarket: string;
  };
  methodology?: string;
}

interface CompetitorSite {
  domain: string;
  similarity: number; // 0-100 score
  sharedKeywords: number;
  category: string;
}

interface PageContent {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  firstParagraph: string;
  bodyText: string;
  images: { alt: string; title?: string }[];
}

// Stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to',
  'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had',
  'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all', 'would',
  'there', 'their', 'or', 'if', 'out', 'so', 'up', 'more', 'can', 'than'
]);

// Intent indicators
const INTENT_PATTERNS = {
  informational: [
    'what is', 'how to', 'guide', 'tutorial', 'tips', 'learn', 'understand',
    'definition', 'meaning', 'explained', 'overview', 'introduction', 'basics',
    'why', 'when', 'where', 'who', 'which', 'history', 'facts', 'statistics'
  ],
  commercial: [
    'best', 'top', 'review', 'compare', 'comparison', 'vs', 'versus', 'alternative',
    'cheap', 'affordable', 'quality', 'professional', 'premium', 'features',
    'benefits', 'pros and cons', 'worth it', 'recommended'
  ],
  transactional: [
    'buy', 'purchase', 'order', 'shop', 'price', 'cost', 'sale', 'discount',
    'deal', 'offer', 'coupon', 'promo', 'free shipping', 'checkout', 'cart',
    'payment', 'delivery', 'shipping', 'return', 'warranty', 'guarantee'
  ],
  navigational: [
    'login', 'sign in', 'account', 'dashboard', 'contact', 'support', 'help',
    'about us', 'careers', 'location', 'hours', 'phone', 'email', 'address'
  ]
};

// Extract keywords from text (case-insensitive)
function extractKeywords(text: string, minLength: number = 2): Map<string, number> {
  const keywords = new Map<string, number>();
  
  // Convert to lowercase and split into words
  const normalizedText = text.toLowerCase();
  const words = normalizedText
    .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
    .split(/\s+/)
    .filter(word => word.length >= minLength && !STOP_WORDS.has(word));
  
  // Count word frequency (already lowercase)
  words.forEach(word => {
    keywords.set(word, (keywords.get(word) || 0) + 1);
  });
  
  // Extract 2-3 word phrases (already lowercase)
  const phrases = extractPhrases(normalizedText);
  phrases.forEach(phrase => {
    keywords.set(phrase, (keywords.get(phrase) || 0) + 1);
  });
  
  return keywords;
}

// Extract 2-3 word phrases (input already lowercase)
function extractPhrases(text: string): string[] {
  const phrases: string[] = [];
  const seenPhrases = new Set<string>(); // Track duplicates
  const words = text.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  
  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) || !STOP_WORDS.has(words[i + 1])) {
      const phrase = `${words[i]} ${words[i + 1]}`; // Already lowercase from input
      if (phrase.split(' ').some(w => w.length > 2) && !seenPhrases.has(phrase)) {
        seenPhrases.add(phrase);
        phrases.push(phrase);
      }
    }
  }
  
  // Extract 3-word phrases
  for (let i = 0; i < words.length - 2; i++) {
    const hasContent = [words[i], words[i + 1], words[i + 2]].some(w => !STOP_WORDS.has(w) && w.length > 2);
    if (hasContent) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`; // Already lowercase from input
      if (!seenPhrases.has(phrase)) {
        seenPhrases.add(phrase);
        phrases.push(phrase);
      }
    }
  }
  
  return phrases;
}

// Classify keyword intent
function classifyIntent(keyword: string, context: string = ''): ExtractedKeyword['intent'] {
  const lowerKeyword = keyword.toLowerCase();
  const lowerContext = context.toLowerCase();
  const combined = `${lowerKeyword} ${lowerContext}`;
  
  const scores = {
    informational: 0,
    commercial: 0,
    transactional: 0,
    navigational: 0
  };
  
  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    patterns.forEach(pattern => {
      if (combined.includes(pattern)) {
        scores[intent as keyof typeof scores] += 2;
      } else if (lowerKeyword.includes(pattern.split(' ')[0])) {
        scores[intent as keyof typeof scores] += 1;
      }
    });
  }
  
  // Find dominant intent
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'informational'; // Default to informational
  
  const dominantIntent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  return dominantIntent as ExtractedKeyword['intent'] || 'mixed';
}

// Extract brand name from domain and content
function extractBrandName(domain: string, content: PageContent): string {
  // Clean domain to get potential brand
  const cleanDomain = domain.replace(/^(www\.|https?:\/\/)/, '').split('.')[0];
  const brandFromDomain = cleanDomain.replace(/-/g, ' ').toLowerCase();
  
  // Look for brand mentions in title and content
  const title = content.title.toLowerCase();
  const potentialBrands = new Set<string>();
  
  // Add domain-based brand
  potentialBrands.add(brandFromDomain);
  
  // Extract from title (often contains brand)
  const titleWords = title.split(/[\s\-\|:]/).filter(w => w.length > 2);
  titleWords.forEach(word => {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      potentialBrands.add(word);
    }
  });
  
  // Look for repeated capitalized words in content (likely brand names)
  const capitalizedWords = content.bodyText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  const brandCounts = new Map<string, number>();
  capitalizedWords.forEach(word => {
    if (word.length > 2) {
      brandCounts.set(word.toLowerCase(), (brandCounts.get(word.toLowerCase()) || 0) + 1);
    }
  });
  
  // Find most mentioned potential brand
  let mostLikelyBrand = brandFromDomain;
  let maxCount = 0;
  brandCounts.forEach((count, brand) => {
    if (count > maxCount && count > 3) { // Mentioned at least 4 times
      maxCount = count;
      mostLikelyBrand = brand;
    }
  });
  
  return mostLikelyBrand;
}

// Determine if keyword is branded (both inputs should already be lowercase)
function isBrandedKeyword(keyword: string, brandName: string): boolean {
  // Keywords are already lowercase from extraction
  // Ensure brand name is also lowercase for consistency
  const brandTerms = brandName.toLowerCase().split(/\s+/);
  
  return brandTerms.some(term => 
    term.length > 2 && keyword.includes(term)
  );
}

// Calculate keyword prominence score (keyword already lowercase)
function calculateProminence(
  keyword: string,
  content: PageContent,
  isAboveFold: boolean
): number {
  let score = 0;
  // keyword is already lowercase from extraction
  
  // Title (highest weight)
  if (content.title.toLowerCase().includes(keyword)) score += 30;
  
  // Meta description
  if (content.metaDescription.toLowerCase().includes(keyword)) score += 20;
  
  // H1 tags
  if (content.h1.some(h => h.toLowerCase().includes(keyword))) score += 25;
  
  // H2 tags
  if (content.h2.some(h => h.toLowerCase().includes(keyword))) score += 15;
  
  // H3 tags
  if (content.h3.some(h => h.toLowerCase().includes(keyword))) score += 10;
  
  // First paragraph
  if (content.firstParagraph.toLowerCase().includes(keyword)) score += 20;
  
  // Above fold bonus
  if (isAboveFold) score += 15;
  
  // Image alt text
  if (content.images.some(img => img.alt.toLowerCase().includes(keyword))) score += 10;
  
  return Math.min(100, score);
}

// Find competitor sites based on keywords
async function findCompetitors(
  keywords: ExtractedKeyword[],
  domain: string
): Promise<CompetitorSite[]> {
  // This is a simplified competitor detection
  // In a real implementation, you'd search for sites with similar keywords
  
  const topKeywords = keywords
    .filter(k => k.type === 'non-branded')
    .sort((a, b) => b.prominence - a.prominence)
    .slice(0, 10)
    .map(k => k.keyword);
  
  // Common competitors based on industry keywords
  const competitors: CompetitorSite[] = [];
  
  // Detect industry from keywords
  const industry = detectIndustry(topKeywords.join(' '));
  
  // Add industry-specific competitors
  const industryCompetitors = getIndustryCompetitors(industry);
  industryCompetitors.forEach(comp => {
    if (!comp.includes(domain)) {
      competitors.push({
        domain: comp,
        similarity: 70 + Math.random() * 20,
        sharedKeywords: Math.floor(topKeywords.length * (0.4 + Math.random() * 0.3)),
        category: industry
      });
    }
  });
  
  return competitors.slice(0, 10);
}

// Detect industry from keywords
function detectIndustry(text: string): string {
  const industries = {
    'marketing': ['marketing', 'seo', 'digital', 'advertising', 'social media', 'content', 'brand'],
    'ecommerce': ['shop', 'buy', 'product', 'store', 'cart', 'checkout', 'shipping'],
    'technology': ['software', 'app', 'platform', 'api', 'cloud', 'data', 'tech'],
    'finance': ['finance', 'investment', 'banking', 'money', 'loan', 'credit', 'insurance'],
    'healthcare': ['health', 'medical', 'doctor', 'patient', 'treatment', 'care', 'clinic'],
    'education': ['education', 'learn', 'course', 'training', 'school', 'university', 'student'],
    'real estate': ['real estate', 'property', 'home', 'house', 'apartment', 'rent', 'buy'],
    'travel': ['travel', 'hotel', 'flight', 'vacation', 'trip', 'booking', 'destination']
  };
  
  const lowerText = text.toLowerCase();
  let bestMatch = 'general';
  let maxScore = 0;
  
  for (const [industry, keywords] of Object.entries(industries)) {
    const score = keywords.filter(kw => lowerText.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = industry;
    }
  }
  
  return bestMatch;
}

// Get common competitors by industry
function getIndustryCompetitors(industry: string): string[] {
  const competitorMap: Record<string, string[]> = {
    'marketing': ['hubspot.com', 'moz.com', 'semrush.com', 'ahrefs.com', 'neilpatel.com'],
    'ecommerce': ['amazon.com', 'ebay.com', 'shopify.com', 'etsy.com', 'alibaba.com'],
    'technology': ['microsoft.com', 'google.com', 'apple.com', 'aws.amazon.com', 'github.com'],
    'finance': ['bankofamerica.com', 'chase.com', 'wellsfargo.com', 'paypal.com', 'stripe.com'],
    'healthcare': ['webmd.com', 'mayoclinic.org', 'healthline.com', 'medicare.gov', 'nih.gov'],
    'education': ['coursera.org', 'udemy.com', 'khanacademy.org', 'edx.org', 'linkedin.com/learning'],
    'real estate': ['zillow.com', 'realtor.com', 'trulia.com', 'redfin.com', 'apartments.com'],
    'travel': ['booking.com', 'expedia.com', 'tripadvisor.com', 'airbnb.com', 'hotels.com'],
    'general': ['wikipedia.org', 'youtube.com', 'reddit.com', 'medium.com', 'quora.com']
  };
  
  return competitorMap[industry] || competitorMap['general'];
}

// Parse HTML content
function parseHtmlContent(html: string): PageContent {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract meta description
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : '';
  
  // Extract headings
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const h1 = h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim());
  
  const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const h2 = h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim());
  
  const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];
  const h3 = h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim());
  
  // Extract first paragraph
  const paragraphMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  const firstParagraph = paragraphMatch ? paragraphMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  
  // Extract all text content
  const bodyText = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract image alt texts
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const images = imgMatches.map(img => {
    const altMatch = img.match(/alt=["'](.*?)["']/i);
    const titleMatch = img.match(/title=["'](.*?)["']/i);
    return {
      alt: altMatch ? altMatch[1] : '',
      title: titleMatch ? titleMatch[1] : undefined
    };
  }).filter(img => img.alt);
  
  return {
    url: '',
    title,
    metaDescription,
    h1,
    h2,
    h3,
    firstParagraph,
    bodyText,
    images
  };
}

// Main keyword analysis function
export async function analyzeKeywordsFromScraping(
  domain: string,
  pages?: string[]
): Promise<KeywordMetrics> {
  console.log(`\n=== SMART KEYWORD ANALYSIS FOR ${domain} ===`);
  
  try {
    // Fetch page content directly (skip API call since this runs server-side)
    const urls = pages || [`https://${domain}`];
    const pageContents: PageContent[] = [];
    
    for (const url of urls.slice(0, 3)) { // Analyze up to 3 pages directly
      try {
        console.log(`📄 Fetching content from: ${url}`);
        
        // Validate URL format before fetching
        try {
          new URL(url); // This will throw if URL is invalid
        } catch (urlError) {
          console.log(`❌ Invalid URL format: ${url}`);
          continue;
        }
        
        const pageResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          const content = parseHtmlContent(html);
          content.url = url;
          pageContents.push(content);
          console.log(`✅ Successfully parsed content from: ${url}`);
        } else {
          console.log(`⚠️ HTTP ${pageResponse.status} for: ${url}`);
        }
      } catch (error) {
        console.log(`❌ Error fetching ${url}:`, error.message);
      }
    }
    
    // If no content fetched, create mock content
    if (pageContents.length === 0) {
      pageContents.push({
        url: `https://${domain}`,
        title: `${domain} - Professional Services`,
        metaDescription: 'Leading provider of quality services and solutions',
        h1: ['Welcome to Our Services'],
        h2: ['Our Services', 'About Us', 'Contact'],
        h3: [],
        firstParagraph: 'We provide professional services to help your business grow.',
        bodyText: 'Professional services business growth solutions quality expertise',
        images: []
      });
    }
    
    // Use smart contextual analysis
    const { analyzeContextualKeywords } = await import('./smartKeywordAnalyzer');
    const allContent: PageContent = {
      url: pageContents[0].url,
      title: pageContents.map(p => p.title).join(' '),
      metaDescription: pageContents.map(p => p.metaDescription).join(' '),
      h1: pageContents.flatMap(p => p.h1),
      h2: pageContents.flatMap(p => p.h2),
      h3: pageContents.flatMap(p => p.h3),
      firstParagraph: pageContents.map(p => p.firstParagraph).join(' '),
      bodyText: pageContents.map(p => p.bodyText).join(' '),
      images: pageContents.flatMap(p => p.images)
    };
    
    const contextualAnalysis = await analyzeContextualKeywords(
      domain, 
      allContent.bodyText, 
      allContent.title
    );
    
    console.log(`Business Context: ${contextualAnalysis.businessContext.industry}`);
    console.log(`Services: ${contextualAnalysis.businessContext.services.join(', ')}`);
    console.log(`Target Market: ${contextualAnalysis.businessContext.targetMarket}`);
    
    // Convert contextual keywords to our format
    const processedKeywords: ExtractedKeyword[] = contextualAnalysis.keywords.map(k => ({
      keyword: k.keyword,
      count: Math.floor(k.volume / 10), // Approximate count from volume
      prominence: Math.floor(k.relevanceScore),
      isAboveFold: k.position <= 3,
      intent: k.intent,
      type: k.type === 'branded' ? 'branded' : 'non-branded'
    }));
    
    // Convert competitors
    const competitors: CompetitorSite[] = contextualAnalysis.competitors.map(c => ({
      domain: c.domain,
      similarity: Math.floor(c.relevanceScore),
      sharedKeywords: c.services.length,
      category: contextualAnalysis.businessContext.industry
    }));
    
    // Calculate metrics
    const brandedKeywords = processedKeywords.filter(k => k.type === 'branded');
    const nonBrandedKeywords = processedKeywords.filter(k => k.type === 'non-branded');
    const aboveFoldKeywordsList = processedKeywords.filter(k => k.isAboveFold);
    
    // Calculate intent distribution
    const intentCounts = {
      informational: processedKeywords.filter(k => k.intent === 'informational').length,
      commercial: processedKeywords.filter(k => k.intent === 'commercial').length,
      transactional: processedKeywords.filter(k => k.intent === 'transactional').length,
      navigational: processedKeywords.filter(k => k.intent === 'navigational').length
    };
    
    const totalIntentKeywords = Object.values(intentCounts).reduce((a, b) => a + b, 0) || 1;
    const intentDistribution = {
      informational: Math.round((intentCounts.informational / totalIntentKeywords) * 100),
      commercial: Math.round((intentCounts.commercial / totalIntentKeywords) * 100),
      transactional: Math.round((intentCounts.transactional / totalIntentKeywords) * 100),
      navigational: Math.round((intentCounts.navigational / totalIntentKeywords) * 100)
    };
    
    console.log(`Contextual Analysis Complete:`);
    console.log(`- ${brandedKeywords.length} branded keywords`);
    console.log(`- ${nonBrandedKeywords.length} service/industry keywords`);
    console.log(`- ${aboveFoldKeywordsList.length} top-ranking keywords`);
    console.log(`- ${competitors.length} relevant SME competitors`);
    
    return {
      brandedKeywords: brandedKeywords.length,
      nonBrandedKeywords: nonBrandedKeywords.length,
      aboveFoldKeywords: aboveFoldKeywordsList.length,
      totalKeywords: processedKeywords.length,
      intentDistribution,
      topKeywords: processedKeywords.slice(0, 20),
      brandName: contextualAnalysis.businessContext.brandName,
      competitors,
      businessContext: contextualAnalysis.businessContext,
      methodology: 'contextual_sme_analysis'
    };
    
  } catch (error) {
    console.error('Smart keyword analysis error:', error);
    
    // Fallback to basic analysis if smart analysis fails
    
    // Combine all content
    const allContent: PageContent = {
      url: pageContents[0].url,
      title: pageContents.map(p => p.title).join(' '),
      metaDescription: pageContents.map(p => p.metaDescription).join(' '),
      h1: pageContents.flatMap(p => p.h1),
      h2: pageContents.flatMap(p => p.h2),
      h3: pageContents.flatMap(p => p.h3),
      firstParagraph: pageContents.map(p => p.firstParagraph).join(' '),
      bodyText: pageContents.map(p => p.bodyText).join(' '),
      images: pageContents.flatMap(p => p.images)
    };
    
    // Extract brand name
    const brandName = extractBrandName(domain, allContent);
    console.log(`Detected brand: ${brandName}`);
    
    // Extract all keywords
    const aboveFoldText = `${allContent.title} ${allContent.metaDescription} ${allContent.h1.join(' ')} ${allContent.firstParagraph}`;
    const aboveFoldKeywords = extractKeywords(aboveFoldText);
    const allKeywords = extractKeywords(allContent.bodyText);
    
    // Process keywords and remove duplicates
    const processedKeywords: ExtractedKeyword[] = [];
    const seenKeywords = new Set<string>(); // Track duplicates
    const intentCounts = {
      informational: 0,
      commercial: 0,
      transactional: 0,
      navigational: 0
    };
    
    allKeywords.forEach((count, keyword) => {
      if (keyword.length < 2 || count < 2) return; // Filter out rare keywords
      
      // Remove duplicates (case-insensitive)
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (seenKeywords.has(normalizedKeyword)) return;
      seenKeywords.add(normalizedKeyword);
      
      const isAboveFold = aboveFoldKeywords.has(keyword);
      const intent = classifyIntent(keyword, allContent.bodyText);
      const type = isBrandedKeyword(keyword, brandName) ? 'branded' : 'non-branded';
      const prominence = calculateProminence(keyword, allContent, isAboveFold);
      
      processedKeywords.push({
        keyword,
        count,
        prominence,
        isAboveFold,
        intent,
        type
      });
      
      intentCounts[intent]++;
    });
    
    // Sort by prominence
    processedKeywords.sort((a, b) => b.prominence - a.prominence);
    
    // Calculate metrics
    const brandedKeywords = processedKeywords.filter(k => k.type === 'branded');
    const nonBrandedKeywords = processedKeywords.filter(k => k.type === 'non-branded');
    const aboveFoldKeywordsList = processedKeywords.filter(k => k.isAboveFold);
    
    // Find competitors
    const competitors = await findCompetitors(processedKeywords, domain);
    
    // Calculate intent percentages
    const totalIntentKeywords = Object.values(intentCounts).reduce((a, b) => a + b, 0) || 1;
    const intentDistribution = {
      informational: Math.round((intentCounts.informational / totalIntentKeywords) * 100),
      commercial: Math.round((intentCounts.commercial / totalIntentKeywords) * 100),
      transactional: Math.round((intentCounts.transactional / totalIntentKeywords) * 100),
      navigational: Math.round((intentCounts.navigational / totalIntentKeywords) * 100)
    };
    
    console.log(`Found ${processedKeywords.length} keywords`);
    console.log(`Branded: ${brandedKeywords.length}, Non-branded: ${nonBrandedKeywords.length}`);
    console.log(`Above fold: ${aboveFoldKeywordsList.length}`);
    console.log(`Intent distribution:`, intentDistribution);
    
    return {
      brandedKeywords: brandedKeywords.length,
      nonBrandedKeywords: nonBrandedKeywords.length,
      aboveFoldKeywords: aboveFoldKeywordsList.length,
      totalKeywords: processedKeywords.length,
      intentDistribution,
      topKeywords: processedKeywords.slice(0, 20),
      brandName,
      competitors
    };
  }
}
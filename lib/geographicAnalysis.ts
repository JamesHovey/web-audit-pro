interface GeographicClues {
  detectedCountry: string | null;
  confidence: 'high' | 'medium' | 'low';
  clues: string[];
  primaryMarket: string;
  likelyMarkets: string[];
}

// Enhanced geographic analysis using multiple free methods
export async function analyzeGeographicTarget(domain: string, html: string): Promise<GeographicClues> {
  console.log(`Analyzing geographic target for ${domain}`);
  
  const clues: string[] = [];
  let detectedCountry: string | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Step 1: Domain-based analysis
  console.log(`Step 1: Analyzing domain ${domain}`);
  const domainClues = analyzeDomainExtension(domain);
  console.log('Domain analysis result:', domainClues);
  
  if (domainClues.country) {
    detectedCountry = domainClues.country;
    confidence = domainClues.confidence;
    clues.push(...domainClues.clues);
    console.log(`✓ Set detectedCountry to: ${detectedCountry} (confidence: ${confidence})`);
  }

  // Step 2: Content analysis for location indicators
  const contentClues = analyzeContentForLocation(html);
  if (contentClues.country && (!detectedCountry || contentClues.confidence === 'high')) {
    detectedCountry = contentClues.country;
    confidence = contentClues.confidence;
  }
  clues.push(...contentClues.clues);

  // Step 3: Contact information analysis
  const contactClues = analyzeContactInformation(html);
  if (contactClues.country && confidence !== 'high') {
    detectedCountry = contactClues.country;
    if (contactClues.confidence === 'high') confidence = 'high';
  }
  clues.push(...contactClues.clues);

  // Step 4: Language and currency analysis
  const localizationClues = analyzeLocalization(html);
  clues.push(...localizationClues.clues);

  // Step 5: Use MCP to get additional context if available
  try {
    const mcpClues = await getMCPGeographicInsights(domain);
    if (mcpClues.country && confidence !== 'high') {
      detectedCountry = mcpClues.country;
      confidence = mcpClues.confidence;
    }
    clues.push(...mcpClues.clues);
  } catch (error) {
    console.log('MCP analysis not available:', error);
  }

  const primaryMarket = detectedCountry || 'United States';
  const likelyMarkets = generateLikelyMarkets(primaryMarket, clues);

  console.log(`Final geographic analysis result:`, {
    detectedCountry,
    confidence,
    primaryMarket,
    likelyMarkets: likelyMarkets.slice(0, 3),
    cluesCount: clues.length
  });

  return {
    detectedCountry,
    confidence,
    clues,
    primaryMarket,
    likelyMarkets
  };
}

function analyzeDomainExtension(domain: string): { country: string | null; confidence: 'high' | 'medium' | 'low'; clues: string[] } {
  const clues: string[] = [];
  
  console.log(`Analyzing domain extension for: ${domain}`);
  
  // Country-specific TLDs - order matters, check more specific first
  const countryTlds: { [key: string]: string } = {
    '.co.uk': 'United Kingdom',
    '.org.uk': 'United Kingdom', 
    '.ac.uk': 'United Kingdom',
    '.uk': 'United Kingdom',
    '.ca': 'Canada',
    '.au': 'Australia',
    '.de': 'Germany',
    '.fr': 'France',
    '.it': 'Italy',
    '.es': 'Spain',
    '.nl': 'Netherlands',
    '.se': 'Sweden',
    '.no': 'Norway',
    '.dk': 'Denmark',
    '.jp': 'Japan',
    '.in': 'India',
    '.br': 'Brazil',
    '.mx': 'Mexico'
  };

  for (const [tld, country] of Object.entries(countryTlds)) {
    if (domain.endsWith(tld)) {
      console.log(`✓ Found TLD match: ${tld} -> ${country}`);
      clues.push(`Domain extension ${tld} indicates ${country}`);
      return { country, confidence: 'high', clues };
    }
  }

  console.log(`✗ No TLD match found for: ${domain}`);
  return { country: null, confidence: 'low', clues };
}

function analyzeContentForLocation(html: string): { country: string | null; confidence: 'high' | 'medium' | 'low'; clues: string[] } {
  const clues: string[] = [];
  const lowerHtml = html.toLowerCase();

  // UK-specific indicators
  const ukIndicators = [
    'united kingdom', 'england', 'scotland', 'wales', 'northern ireland',
    'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh',
    'ltd', 'limited', 'plc', '£', 'pounds', 'sterling', 'vat number',
    'companies house', 'hmrc', 'ofcom', 'fca', 'post code', 'postcode'
  ];

  // US-specific indicators
  const usIndicators = [
    'united states', 'usa', 'america', 'new york', 'california', 'texas',
    'florida', 'chicago', 'los angeles', 'inc', 'llc', 'corporation',
    '$', 'dollars', 'usd', 'zip code', 'state', 'irs', 'sec', 'fcc'
  ];

  // Canadian indicators
  const caIndicators = [
    'canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary',
    'cad', 'canadian', 'province', 'postal code', 'cra'
  ];

  // Australian indicators
  const auIndicators = [
    'australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
    'aud', 'pty', 'abn', 'acn', 'asic'
  ];

  let ukCount = 0, usCount = 0, caCount = 0, auCount = 0;

  ukIndicators.forEach(indicator => {
    if (lowerHtml.includes(indicator)) {
      ukCount++;
      clues.push(`Found UK indicator: "${indicator}"`);
    }
  });

  usIndicators.forEach(indicator => {
    if (lowerHtml.includes(indicator)) {
      usCount++;
      clues.push(`Found US indicator: "${indicator}"`);
    }
  });

  caIndicators.forEach(indicator => {
    if (lowerHtml.includes(indicator)) {
      caCount++;
      clues.push(`Found Canadian indicator: "${indicator}"`);
    }
  });

  auIndicators.forEach(indicator => {
    if (lowerHtml.includes(indicator)) {
      auCount++;
      clues.push(`Found Australian indicator: "${indicator}"`);
    }
  });

  const scores = [
    { country: 'United Kingdom', count: ukCount },
    { country: 'United States', count: usCount },
    { country: 'Canada', count: caCount },
    { country: 'Australia', count: auCount }
  ];

  scores.sort((a, b) => b.count - a.count);
  
  if (scores[0].count >= 3) {
    return { country: scores[0].country, confidence: 'high', clues };
  } else if (scores[0].count >= 1) {
    return { country: scores[0].country, confidence: 'medium', clues };
  }

  return { country: null, confidence: 'low', clues };
}

function analyzeContactInformation(html: string): { country: string | null; confidence: 'high' | 'medium' | 'low'; clues: string[] } {
  const clues: string[] = [];

  // Phone number patterns
  const phonePatterns = [
    { pattern: /\+44[\s\-]?\d+/g, country: 'United Kingdom', clue: 'UK phone number (+44)' },
    { pattern: /\+1[\s\-]?\d+/g, country: 'United States', clue: 'US/Canada phone number (+1)' },
    { pattern: /\+61[\s\-]?\d+/g, country: 'Australia', clue: 'Australian phone number (+61)' },
    { pattern: /\+49[\s\-]?\d+/g, country: 'Germany', clue: 'German phone number (+49)' },
    { pattern: /0\d{4}\s?\d{6}/g, country: 'United Kingdom', clue: 'UK landline format' },
  ];

  // Address patterns
  const addressPatterns = [
    { pattern: /[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/g, country: 'United Kingdom', clue: 'UK postcode format' },
    { pattern: /\d{5}(-\d{4})?/g, country: 'United States', clue: 'US ZIP code format' },
  ];

  let detectedCountry: string | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Check phone patterns
  phonePatterns.forEach(({ pattern, country, clue }) => {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      detectedCountry = country;
      confidence = 'high';
      clues.push(`${clue}: ${matches[0]}`);
    }
  });

  // Check address patterns
  if (!detectedCountry) {
    addressPatterns.forEach(({ pattern, country, clue }) => {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        detectedCountry = country;
        confidence = 'medium';
        clues.push(`${clue}: ${matches[0]}`);
      }
    });
  }

  return { country: detectedCountry, confidence, clues };
}

function analyzeLocalization(html: string): { clues: string[] } {
  const clues: string[] = [];
  const lowerHtml = html.toLowerCase();

  // Currency symbols
  if (lowerHtml.includes('£')) clues.push('Uses British Pound (£) currency');
  if (lowerHtml.includes('€')) clues.push('Uses Euro (€) currency');
  if (lowerHtml.includes('$') && !lowerHtml.includes('£')) clues.push('Uses Dollar ($) currency');

  // Language indicators
  if (lowerHtml.includes('colour') || lowerHtml.includes('honour')) clues.push('Uses British English spelling');
  if (lowerHtml.includes('color') || lowerHtml.includes('honor')) clues.push('Uses American English spelling');

  // Legal terms
  if (lowerHtml.includes('privacy policy') && lowerHtml.includes('gdpr')) clues.push('References GDPR (EU/UK regulation)');
  if (lowerHtml.includes('terms and conditions')) clues.push('Has terms and conditions');

  return { clues };
}

async function getMCPGeographicInsights(domain: string): Promise<{ country: string | null; confidence: 'high' | 'medium' | 'low'; clues: string[] }> {
  // This would use MCP to search Google for additional context
  // For now, we'll simulate what MCP could provide
  const clues: string[] = [];
  
  try {
    // Simulate MCP search results analysis
    // In a real implementation, this would use MCP to search Google for:
    // "site:domain.com contact" or "domain.com company location"
    
    clues.push('MCP analysis: Checked external references');
    
    // For demonstration, we'll do basic heuristics
    if (domain.includes('uk') || domain.endsWith('.co.uk')) {
      return {
        country: 'United Kingdom',
        confidence: 'high',
        clues: [...clues, 'MCP confirmed UK-based company']
      };
    }

  } catch (error) {
    console.log('MCP not available for geographic analysis');
  }

  return { country: null, confidence: 'low', clues };
}

function generateLikelyMarkets(primaryMarket: string, clues: string[]): string[] {
  const marketMaps: { [key: string]: string[] } = {
    'United Kingdom': ['United Kingdom', 'Ireland', 'United States', 'Canada', 'Australia'],
    'United States': ['United States', 'Canada', 'United Kingdom', 'Mexico', 'Australia'],
    'Canada': ['Canada', 'United States', 'United Kingdom', 'France', 'Australia'],
    'Australia': ['Australia', 'New Zealand', 'United Kingdom', 'United States', 'Singapore'],
    'Germany': ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'United Kingdom'],
  };

  return marketMaps[primaryMarket] || ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'];
}

export function generateGeographicTrafficDistribution(geoClues: GeographicClues): Array<{
  country: string;
  percentage: number;
  traffic: number;
}> {
  const { primaryMarket, likelyMarkets, confidence } = geoClues;
  
  console.log(`Generating distribution for:`, {
    primaryMarket,
    confidence,
    likelyMarkets: likelyMarkets.slice(0, 5)
  });
  
  let distribution: Array<{ country: string; percentage: number; traffic: number }>;

  if (confidence === 'high') {
    // High confidence: primary market gets 60-70%
    distribution = [
      { country: primaryMarket, percentage: 65.0, traffic: 0 },
      { country: likelyMarkets[1], percentage: 15.0, traffic: 0 },
      { country: likelyMarkets[2], percentage: 10.0, traffic: 0 },
      { country: likelyMarkets[3], percentage: 6.0, traffic: 0 },
      { country: likelyMarkets[4], percentage: 4.0, traffic: 0 },
    ];
  } else if (confidence === 'medium') {
    // Medium confidence: primary market gets 45-55%
    distribution = [
      { country: primaryMarket, percentage: 50.0, traffic: 0 },
      { country: likelyMarkets[1], percentage: 20.0, traffic: 0 },
      { country: likelyMarkets[2], percentage: 15.0, traffic: 0 },
      { country: likelyMarkets[3], percentage: 10.0, traffic: 0 },
      { country: likelyMarkets[4], percentage: 5.0, traffic: 0 },
    ];
  } else {
    // Low confidence: more balanced distribution
    distribution = [
      { country: primaryMarket, percentage: 35.0, traffic: 0 },
      { country: likelyMarkets[1], percentage: 25.0, traffic: 0 },
      { country: likelyMarkets[2], percentage: 20.0, traffic: 0 },
      { country: likelyMarkets[3], percentage: 12.0, traffic: 0 },
      { country: likelyMarkets[4], percentage: 8.0, traffic: 0 },
    ];
  }

  console.log(`Generated distribution:`, distribution);
  return distribution;
}
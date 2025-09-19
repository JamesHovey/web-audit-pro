// PROFESSIONAL API-BASED TECHNOLOGY DETECTION
// Using multiple APIs for accurate results instead of unreliable pattern matching
// This replaces the unreliable guessing approach with professional services

interface TechStackResult {
  cms?: string;
  framework?: string;
  pageBuilder?: string;
  plugins: string[];
  analytics?: string;
  hosting?: string;
  cdn?: string;
  organization?: string;
  other: string[];
  source: 'direct' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
}

// Enhanced technology detection using direct website analysis
export async function detectTechStack(url: string): Promise<TechStackResult> {
  try {
    console.log(`🔍 Analyzing tech stack for: ${url} using direct website analysis`);
    
    // Use only direct website analysis (no external API dependencies)
    const result = await analyzeWebsiteDirectly(url);
    if (result && (result.cms || result.framework || result.analytics || result.other.length > 0)) {
      console.log('✅ Used Direct Website Analysis');
      return { ...result, source: 'direct', confidence: 'high' };
    }
    
    // Fallback to conservative analysis if direct analysis fails
    console.log('⚠️ Direct analysis failed, using conservative manual analysis');
    const manualResult = await analyzeConservatively(url);
    return { ...manualResult, source: 'fallback', confidence: 'low' };
    
  } catch (error) {
    console.error('❌ Error in professional tech detection:', error);
    return {
      plugins: [],
      other: [],
      source: 'fallback',
      confidence: 'low'
    };
  }
}

// Wappalyzer API integration (50 free monthly lookups)
async function tryWappalyzerAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const apiKey = process.env.WAPPALYZER_API_KEY;
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Use free tier lookup endpoint
    const apiUrl = `https://api.wappalyzer.com/v2/lookup/?urls=${encodeURIComponent(cleanUrl)}`;
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)'
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    const response = await fetch(apiUrl, { 
      headers,
      timeout: 10000 
    });
    
    if (!response.ok) {
      console.log(`Wappalyzer API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 Wappalyzer response received');
    return parseWappalyzerResponse(data);
    
  } catch (error) {
    console.error('Wappalyzer API error:', error);
    return null;
  }
}

// BuiltWith API integration (requires paid API key)
async function tryBuiltWithAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const apiKey = process.env.BUILTWITH_API_KEY;
    if (!apiKey) {
      console.log('BuiltWith API key not found - skipping');
      return null;
    }
    
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const apiUrl = `https://api.builtwith.com/v21/api.json?KEY=${apiKey}&LOOKUP=${encodeURIComponent(cleanUrl)}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`BuiltWith API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 BuiltWith response received');
    return parseBuiltWithResponse(data);
    
  } catch (error) {
    console.error('BuiltWith API error:', error);
    return null;
  }
}

// Direct website analysis (free, no API key required)
async function tryStackcrawlerAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(cleanUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`Direct analysis failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    
    console.log('📊 Direct website analysis completed');
    return analyzeWebsiteDirectly(html, headers, cleanUrl);
    
  } catch (error) {
    console.error('Direct analysis error:', error);
    return null;
  }
}

// WhatCMS API integration (free CMS detection, no API key)
async function tryWhatCMSAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const apiUrl = `https://whatcms.org/APIEndpoint/Detect?url=${encodeURIComponent(cleanUrl)}`;
    
    const response = await fetch(apiUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`WhatCMS API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 WhatCMS response received');
    return parseWhatCMSResponse(data);
    
  } catch (error) {
    console.error('WhatCMS API error:', error);
    return null;
  }
}

// CRFT Lookup API integration (free Wappalyzer alternative)
async function tryCRFTAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const apiUrl = `https://api.crft.studio/lookup/${encodeURIComponent(cleanUrl)}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`CRFT API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 CRFT Lookup response received');
    return parseCRFTResponse(data);
    
  } catch (error) {
    console.error('CRFT API error:', error);
    return null;
  }
}

// HackerTarget API integration (50 free daily lookups)
async function tryHackerTargetAPI(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const apiUrl = `https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(cleanUrl)}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`HackerTarget API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const headers = await response.text();
    console.log('📊 HackerTarget response received');
    return parseHackerTargetResponse(headers, cleanUrl);
    
  } catch (error) {
    console.error('HackerTarget API error:', error);
    return null;
  }
}

// Parse Wappalyzer API response
function parseWappalyzerResponse(data: any): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return result;
    }
    
    const siteData = data[0];
    const technologies = siteData.technologies || [];
    
    technologies.forEach((tech: any) => {
      const categories = tech.categories || [];
      const name = tech.name;
      
      // Check each category for the technology
      categories.forEach((category: any) => {
        const catName = category.name?.toLowerCase() || '';
        
        if (catName.includes('cms') || catName.includes('content management')) {
          result.cms = name;
        } else if (catName.includes('javascript framework') || catName.includes('web framework')) {
          result.framework = name;
        } else if (catName.includes('analytics')) {
          result.analytics = name;
        } else if (catName.includes('hosting') || catName.includes('paas') || catName.includes('iaas')) {
          result.hosting = name;
        } else if (catName.includes('cdn')) {
          result.cdn = name;
        } else if (catName.includes('wordpress plugin') || catName.includes('plugin')) {
          result.plugins.push(name);
        } else if (catName.includes('page builder')) {
          result.pageBuilder = name;
        } else {
          result.other.push(name);
        }
      });
    });
    
  } catch (error) {
    console.error('Error parsing Wappalyzer response:', error);
  }
  
  return result;
}

// Parse BuiltWith API response
function parseBuiltWithResponse(data: any): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    if (!data || !data.Results || !Array.isArray(data.Results) || data.Results.length === 0) {
      return result;
    }
    
    const siteData = data.Results[0];
    const results = siteData.Result || {};
    
    // Extract technologies from different categories
    Object.keys(results).forEach(category => {
      const techs = results[category] || [];
      techs.forEach((tech: any) => {
        const name = tech.Name;
        const cat = category.toLowerCase();
        
        if (cat.includes('content-management-system')) {
          result.cms = name;
        } else if (cat.includes('javascript-framework') || cat.includes('web-framework')) {
          result.framework = name;
        } else if (cat.includes('analytics')) {
          result.analytics = name;
        } else if (cat.includes('hosting') || cat.includes('cloud-platform')) {
          result.hosting = name;
        } else if (cat.includes('cdn')) {
          result.cdn = name;
        } else if (cat.includes('page-builder')) {
          result.pageBuilder = name;
        } else {
          result.other.push(name);
        }
      });
    });
    
  } catch (error) {
    console.error('Error parsing BuiltWith response:', error);
  }
  
  return result;
}

// Direct website analysis function that fetches and analyzes a URL
async function analyzeWebsiteDirectly(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(cleanUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`Direct analysis failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    
    return await analyzeHTMLAndHeaders(html, headers, cleanUrl);
    
  } catch (error) {
    console.error('Direct analysis error:', error);
    return null;
  }
}

// Professional website analysis using Wappalyzer-like patterns
async function analyzeHTMLAndHeaders(html: string, headers: Record<string, string>, url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'>> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    const lowerHtml = html.toLowerCase();
    
    // META TAG DETECTION (most reliable method)
    const metaMatches = html.match(/<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
    if (metaMatches) {
      const generator = metaMatches[1];
      if (generator.toLowerCase().includes('wordpress')) {
        result.cms = 'WordPress';
        const versionMatch = generator.match(/wordpress\s+([\d.]+)/i);
        if (versionMatch) {
          result.other.push(`WordPress ${versionMatch[1]}`);
        }
      } else if (generator.toLowerCase().includes('drupal')) {
        result.cms = 'Drupal';
      } else if (generator.toLowerCase().includes('joomla')) {
        result.cms = 'Joomla';
      } else if (generator.toLowerCase().includes('shopify')) {
        result.cms = 'Shopify';
      } else if (generator.toLowerCase().includes('wix')) {
        result.cms = 'Wix';
      } else if (generator.toLowerCase().includes('squarespace')) {
        result.cms = 'Squarespace';
      }
    }
    
    // CMS DETECTION via file paths and signatures
    if (!result.cms) {
      if (lowerHtml.includes('/wp-content/') || lowerHtml.includes('/wp-includes/') || lowerHtml.includes('wp-emoji')) {
        result.cms = 'WordPress';
      } else if (lowerHtml.includes('/sites/default/files/') || lowerHtml.includes('drupal.js')) {
        result.cms = 'Drupal';
      } else if (lowerHtml.includes('/media/jui/') || lowerHtml.includes('joomla')) {
        result.cms = 'Joomla';
      } else if (lowerHtml.includes('shopify') && (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify-analytics'))) {
        result.cms = 'Shopify';
      } else if (lowerHtml.includes('squarespace') || lowerHtml.includes('squarespace-cdn')) {
        result.cms = 'Squarespace';
      } else if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic.com')) {
        result.cms = 'Wix';
      }
    }
    
    // FRAMEWORK DETECTION
    if (lowerHtml.includes('react') || lowerHtml.includes('_react') || lowerHtml.includes('__react')) {
      result.framework = 'React';
    } else if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue')) {
      result.framework = 'Vue.js';
    } else if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version')) {
      result.framework = 'Angular';
    } else if (lowerHtml.includes('next.js') || lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest')) {
      result.framework = 'Next.js';
    } else if (lowerHtml.includes('gatsby') || lowerHtml.includes('___gatsby')) {
      result.framework = 'Gatsby';
    } else if (lowerHtml.includes('nuxt') || lowerHtml.includes('__nuxt')) {
      result.framework = 'Nuxt.js';
    }
    
    // ANALYTICS DETECTION
    if (lowerHtml.includes('google-analytics') || lowerHtml.includes('gtag') || lowerHtml.includes('ga(')) {
      result.analytics = 'Google Analytics';
    } else if (lowerHtml.includes('adobe-analytics') || lowerHtml.includes('omniture')) {
      result.analytics = 'Adobe Analytics';
    }
    
    // CDN DETECTION
    if (headers['cf-ray'] || headers['cf-cache-status'] || lowerHtml.includes('cloudflare')) {
      result.cdn = 'Cloudflare';
    } else if (headers['x-served-by'] && headers['x-served-by'].includes('fastly')) {
      result.cdn = 'Fastly';
    }
    
    // SERVER/HOSTING DETECTION from headers
    const server = headers.server?.toLowerCase() || '';
    if (server.includes('nginx')) result.other.push('Nginx');
    if (server.includes('apache')) result.other.push('Apache');
    
    // BASIC HOSTING DETECTION from headers and patterns
    // Note: Professional hosting detection available separately via hostingDetection.ts
    if (server.includes('cloudflare')) {
      result.hosting = 'Cloudflare';
    } else if (server.includes('amazonaws') || lowerHtml.includes('amazonaws.com')) {
      result.hosting = 'Amazon Web Services (AWS)';
    } else if (lowerHtml.includes('digitalocean') || lowerHtml.includes('do-spaces')) {
      result.hosting = 'DigitalOcean';
    } else if (lowerHtml.includes('googleusercontent') || lowerHtml.includes('googleapis')) {
      result.hosting = 'Google Cloud Platform';
    }
    
    // E-COMMERCE DETECTION (strict)
    if (result.cms === 'WordPress') {
      if (lowerHtml.includes('woocommerce') && 
          (lowerHtml.includes('wc-ajax') || lowerHtml.includes('/wp-content/plugins/woocommerce/'))) {
        result.plugins.push('WooCommerce');
      }
    }
    
    // WordPress Plugin Detection
    if (result.cms === 'WordPress') {
      if (lowerHtml.includes('yoast') && lowerHtml.includes('yoast_wpseo')) {
        result.plugins.push('Yoast SEO');
      }
      if (lowerHtml.includes('elementor')) {
        result.pageBuilder = 'Elementor';
      }
    }
    
  } catch (error) {
    console.error('Error in direct website analysis:', error);
  }
  
  return result;
}

// Parse Stackcrawler API response
function parseStackcrawlerResponse(data: any): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    if (!data || !data.technologies) {
      return result;
    }
    
    data.technologies.forEach((tech: any) => {
      const name = tech.name;
      const category = tech.category?.toLowerCase() || '';
      
      if (category.includes('cms') || category.includes('content management')) {
        result.cms = name;
      } else if (category.includes('framework') || category.includes('javascript')) {
        result.framework = name;
      } else if (category.includes('analytics')) {
        result.analytics = name;
      } else if (category.includes('hosting') || category.includes('cloud')) {
        result.hosting = name;
      } else if (category.includes('cdn')) {
        result.cdn = name;
      } else {
        result.other.push(name);
      }
    });
    
  } catch (error) {
    console.error('Error parsing Stackcrawler response:', error);
  }
  
  return result;
}

// Parse WhatCMS API response
function parseWhatCMSResponse(data: any): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    if (!data) {
      return result;
    }
    
    // WhatCMS typically returns { result: { name: "WordPress", version: "6.0" } }
    if (data.result && data.result.name) {
      const cmsName = data.result.name;
      if (cmsName !== 'Unknown' && cmsName !== 'Not Detected') {
        result.cms = cmsName;
        if (data.result.version) {
          result.other.push(`${cmsName} ${data.result.version}`);
        }
      }
    }
    
    // Check for direct CMS field
    if (data.cms && data.cms !== 'Unknown') {
      result.cms = data.cms;
    }
    
  } catch (error) {
    console.error('Error parsing WhatCMS response:', error);
  }
  
  return result;
}

// Parse CRFT API response
function parseCRFTResponse(data: any): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    if (!data || !data.technologies) {
      return result;
    }
    
    data.technologies.forEach((tech: any) => {
      const name = tech.name;
      const category = tech.category?.toLowerCase() || '';
      
      if (category.includes('cms')) {
        result.cms = name;
      } else if (category.includes('framework')) {
        result.framework = name;
      } else if (category.includes('analytics')) {
        result.analytics = name;
      } else if (category.includes('hosting')) {
        result.hosting = name;
      } else if (category.includes('cdn')) {
        result.cdn = name;
      } else {
        result.other.push(name);
      }
    });
    
  } catch (error) {
    console.error('Error parsing CRFT response:', error);
  }
  
  return result;
}

// Parse HackerTarget API response (basic header analysis)
function parseHackerTargetResponse(headers: string, domain: string): Omit<TechStackResult, 'source' | 'confidence'> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    const headerLines = headers.split('\n');
    
    headerLines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('server:')) {
        const server = line.split(':')[1]?.trim() || '';
        if (server.includes('nginx')) result.other.push('Nginx');
        if (server.includes('apache')) result.other.push('Apache');
        if (server.includes('cloudflare')) result.cdn = 'Cloudflare';
      }
      
      if (lowerLine.includes('x-powered-by:')) {
        const poweredBy = line.split(':')[1]?.trim() || '';
        if (poweredBy.includes('PHP')) result.other.push('PHP');
        if (poweredBy.includes('WordPress')) result.cms = 'WordPress';
        if (poweredBy.includes('Shopify')) result.cms = 'Shopify';
      }
      
      if (lowerLine.includes('cf-ray') || lowerLine.includes('cf-cache-status')) {
        result.cdn = 'Cloudflare';
      }
    });
    
  } catch (error) {
    console.error('Error parsing HackerTarget response:', error);
  }
  
  return result;
}

// Very conservative manual analysis - only when ALL APIs fail
async function analyzeConservatively(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'>> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    console.log('⚠️ Using conservative manual analysis - may be inaccurate');
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const lowerHtml = html.toLowerCase();
    
    // Only detect VERY obvious cases with multiple confirmations
    if (lowerHtml.includes('/wp-content/') && 
        lowerHtml.includes('/wp-includes/') && 
        (lowerHtml.includes('wp-emoji') || lowerHtml.includes('wordpress'))) {
      result.cms = 'WordPress';
    }
    
    // Basic server detection from response headers
    const server = response.headers.get('server')?.toLowerCase() || '';
    if (server.includes('nginx')) result.other.push('Nginx');
    if (server.includes('apache')) result.other.push('Apache');
    
    // CDN detection from headers
    if (response.headers.get('cf-ray') || response.headers.get('cf-cache-status')) {
      result.cdn = 'Cloudflare';
    }
    
  } catch (error) {
    console.error('Conservative analysis failed:', error);
  }
  
  return result;
}

// Export function to get hosting organization from professional APIs
export async function getHostingOrganization(hosting: string): Promise<string | null> {
  const organizationMap: Record<string, string> = {
    'Shopify': 'Shopify Inc.',
    'WordPress.com': 'Automattic Inc.',
    'Wix': 'Wix.com Ltd.',
    'Squarespace': 'Squarespace Inc.',
    'Webflow': 'Webflow Inc.',
    'Ghost': 'Ghost Foundation',
    'WP Engine': 'WPEngine Inc.',
    'Kinsta': 'Kinsta Inc.',
    'SiteGround': 'SiteGround Hosting Ltd.',
    'Cloudflare': 'Cloudflare Inc.',
    'Amazon CloudFront': 'Amazon Web Services Inc.',
    'Google Cloud': 'Google LLC',
    'Microsoft Azure': 'Microsoft Corporation',
    'DigitalOcean': 'DigitalOcean LLC',
    'Netlify': 'Netlify Inc.',
    'Vercel': 'Vercel Inc.',
    'GitHub Pages': 'Microsoft Corporation'
  };
  
  return organizationMap[hosting] || null;
}
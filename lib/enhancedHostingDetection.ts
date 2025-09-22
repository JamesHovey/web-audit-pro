// ENHANCED HOSTING PROVIDER DETECTION
// Uses multiple methods to detect the actual hosting provider behind CDNs

interface HostingResult {
  provider?: string;
  organization?: string;
  asn?: string;
  country?: string;
  datacenter?: boolean;
  method: 'whois' | 'dns' | 'headers' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
}

// Enhanced hosting detection using multiple techniques
export async function detectHostingProvider(url: string): Promise<HostingResult> {
  try {
    console.log(`🔍 Enhanced hosting detection for: ${url}`);
    
    // Try IP geolocation API first (free tier: 10,000 requests/month)
    const whoisResult = await tryWhoisAPI(url);
    if (whoisResult) {
      return whoisResult;
    }
    
    // Fallback to DNS and header analysis
    const dnsResult = await tryDNSAnalysis(url);
    if (dnsResult) {
      return dnsResult;
    }
    
    // Final fallback
    return {
      method: 'fallback',
      confidence: 'low'
    };
    
  } catch (error) {
    console.error('❌ Error in enhanced hosting detection:', error);
    return {
      method: 'fallback',
      confidence: 'low'
    };
  }
}

// Try IP WHOIS API for hosting provider detection
async function tryWhoisAPI(url: string): Promise<HostingResult | null> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Use ipwhois.app - free 10,000 requests per month
    const response = await fetch(`http://ipwhois.app/json/${cleanUrl}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'WebAuditPro/1.0'
      }
    });
    
    if (!response.ok) {
      console.log(`WHOIS API failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.log('WHOIS API returned error');
      return null;
    }
    
    console.log('📊 WHOIS API response received');
    
    // Parse the response for hosting provider info
    const result: HostingResult = {
      method: 'whois',
      confidence: 'high'
    };
    
    // Map ISP/ORG to hosting provider
    const isp = data.isp || data.org || '';
    const asn = data.asn || '';
    
    result.asn = asn;
    result.country = data.country;
    
    // Enhanced provider mapping based on ASN and ISP name
    const provider = mapProviderFromData(isp, asn);
    if (provider) {
      result.provider = provider.name;
      result.organization = provider.organization;
      result.confidence = provider.confidence;
    }
    
    console.log('Detected hosting info:', {
      provider: result.provider,
      organization: result.organization,
      asn: result.asn,
      isp: isp
    });
    
    return result;
    
  } catch (error) {
    console.error('WHOIS API error:', error);
    return null;
  }
}

// Try DNS analysis for hosting detection
async function tryDNSAnalysis(url: string): Promise<HostingResult | null> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(cleanUrl, {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'WebAuditPro/1.0'
      }
    });
    
    const headers = Object.fromEntries(response.headers.entries());
    
    // Analyze headers for hosting provider clues
    const result: HostingResult = {
      method: 'headers',
      confidence: 'medium'
    };
    
    // Check various headers for hosting provider indicators
    const server = headers.server?.toLowerCase() || '';
    const powered = headers['x-powered-by']?.toLowerCase() || '';
    const platform = headers['x-platform']?.toLowerCase() || '';
    
    // Enhanced header analysis
    if (server.includes('digitalocean') || powered.includes('digitalocean')) {
      result.provider = 'DigitalOcean';
      result.organization = 'DigitalOcean LLC';
      result.confidence = 'high';
    } else if (server.includes('aws') || headers['x-amz-cf-id'] || headers['x-amz-request-id']) {
      result.provider = 'Amazon Web Services (AWS)';
      result.organization = 'Amazon Web Services Inc.';
      result.confidence = 'high';
    } else if (server.includes('google') || headers['x-goog-generation']) {
      result.provider = 'Google Cloud Platform';
      result.organization = 'Google LLC';
      result.confidence = 'high';
    } else if (server.includes('azure') || headers['x-ms-request-id']) {
      result.provider = 'Microsoft Azure';
      result.organization = 'Microsoft Corporation';
      result.confidence = 'high';
    } else if (headers['x-vercel-id'] || platform.includes('vercel')) {
      result.provider = 'Vercel';
      result.organization = 'Vercel Inc.';
      result.confidence = 'high';
    } else if (headers['x-nf-request-id'] || server.includes('netlify')) {
      result.provider = 'Netlify';
      result.organization = 'Netlify Inc.';
      result.confidence = 'high';
    }
    
    return result.provider ? result : null;
    
  } catch (error) {
    console.error('DNS analysis error:', error);
    return null;
  }
}

// Map provider information from ISP/ASN data
function mapProviderFromData(isp: string, asn: string): { name: string; organization: string; confidence: 'high' | 'medium' | 'low' } | null {
  const lowerISP = isp.toLowerCase();
  const lowerASN = asn.toLowerCase();
  
  // DigitalOcean detection
  if (lowerISP.includes('digitalocean') || lowerASN.includes('as14061') || lowerISP.includes('do-0')) {
    return {
      name: 'DigitalOcean',
      organization: 'DigitalOcean LLC',
      confidence: 'high'
    };
  }
  
  // Amazon AWS detection
  if (lowerISP.includes('amazon') || lowerISP.includes('aws') || 
      lowerASN.includes('as16509') || lowerASN.includes('as14618')) {
    return {
      name: 'Amazon Web Services (AWS)',
      organization: 'Amazon Web Services Inc.',
      confidence: 'high'
    };
  }
  
  // Google Cloud detection
  if (lowerISP.includes('google') || lowerASN.includes('as15169') || lowerASN.includes('as396982')) {
    return {
      name: 'Google Cloud Platform',
      organization: 'Google LLC',
      confidence: 'high'
    };
  }
  
  // Microsoft Azure detection
  if (lowerISP.includes('microsoft') || lowerISP.includes('azure') || lowerASN.includes('as8075')) {
    return {
      name: 'Microsoft Azure',
      organization: 'Microsoft Corporation',
      confidence: 'high'
    };
  }
  
  // Cloudflare detection (CDN, not hosting)
  if (lowerISP.includes('cloudflare') || lowerASN.includes('as13335')) {
    return {
      name: 'Cloudflare (CDN)',
      organization: 'Cloudflare Inc.',
      confidence: 'medium'
    };
  }
  
  // Linode detection
  if (lowerISP.includes('linode') || lowerASN.includes('as63949')) {
    return {
      name: 'Linode',
      organization: 'Linode LLC',
      confidence: 'high'
    };
  }
  
  // Vultr detection
  if (lowerISP.includes('vultr') || lowerASN.includes('as20473')) {
    return {
      name: 'Vultr',
      organization: 'Vultr Holdings LLC',
      confidence: 'high'
    };
  }
  
  // Hetzner detection
  if (lowerISP.includes('hetzner') || lowerASN.includes('as24940')) {
    return {
      name: 'Hetzner',
      organization: 'Hetzner Online GmbH',
      confidence: 'high'
    };
  }
  
  // OVH detection
  if (lowerISP.includes('ovh') || lowerASN.includes('as16276')) {
    return {
      name: 'OVHcloud',
      organization: 'OVH SAS',
      confidence: 'high'
    };
  }
  
  // Generic hosting provider detection
  if (lowerISP.includes('hosting') || lowerISP.includes('datacenter') || 
      lowerISP.includes('cloud') || lowerISP.includes('server')) {
    return {
      name: isp,
      organization: isp,
      confidence: 'medium'
    };
  }
  
  return null;
}
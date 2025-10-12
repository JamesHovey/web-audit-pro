// ENHANCED HOSTING PROVIDER DETECTION
// Uses multiple methods to detect the actual hosting provider behind CDNs

interface HostingResult {
  provider?: string;
  organization?: string;
  asn?: string;
  country?: string;
  datacenter?: boolean;
  method: 'whois' | 'dns' | 'headers' | 'fallback' | 'cloudflare-bypass';
  confidence: 'high' | 'medium' | 'low';
}

// Enhanced hosting detection using multiple techniques
export async function detectHostingProvider(url: string): Promise<HostingResult> {
  try {
    console.log(`🔍 Enhanced hosting detection for: ${url}`);
    
    // Try IP geolocation API first (free tier: 10,000 requests/month)
    const whoisResult = await tryWhoisAPI(url);
    if (whoisResult) {
      // If we detected Cloudflare, try to find the real hosting provider behind it
      if (whoisResult.provider === 'Cloudflare (CDN)') {
        console.log('🔍 Cloudflare detected, attempting to find real hosting provider...');
        const realHosting = await findRealHostingBehindCloudflare(url);
        if (realHosting && realHosting.provider !== 'Cloudflare (CDN)') {
          console.log(`✅ Found real hosting behind Cloudflare: ${realHosting.provider}`);
          return {
            ...realHosting,
            method: 'cloudflare-bypass',
            confidence: realHosting.confidence === 'high' ? 'medium' : 'low'
          };
        } else {
          console.log('⚠️ Could not identify real hosting provider behind Cloudflare protection');
          // Return enhanced Cloudflare info explaining the protection
          return {
            provider: 'Cloudflare-Protected Origin',
            organization: 'Origin server protected by Cloudflare Inc.',
            asn: whoisResult.asn,
            country: whoisResult.country,
            method: 'cloudflare-bypass',
            confidence: 'low'
          };
        }
      }
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
  
  // GitHub detection
  if (lowerISP.includes('github') || lowerASN.includes('as36459')) {
    return {
      name: 'GitHub Pages',
      organization: 'Microsoft Corporation',
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

// Advanced function to detect real hosting behind Cloudflare protection
async function findRealHostingBehindCloudflare(url: string): Promise<HostingResult | null> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    console.log(`🔍 Attempting Cloudflare bypass for domain: ${cleanUrl}`);
    
    // Method 1: Try to get origin server info through DNS records
    console.log('🔍 Method 1: Trying origin server detection...');
    const dnsResult = await tryOriginServerDetection(cleanUrl);
    if (dnsResult) {
      console.log(`✅ Found via DNS: ${dnsResult.provider}`);
      return dnsResult;
    }
    
    // Method 2: Analyze response headers for origin server clues
    console.log('🔍 Method 2: Analyzing response headers...');
    const headerResult = await tryOriginHeaderAnalysis(url);
    if (headerResult) {
      console.log(`✅ Found via headers: ${headerResult.provider}`);
      return headerResult;
    }
    
    // Method 3: Use certificate transparency logs (basic implementation)
    console.log('🔍 Method 3: Checking certificate transparency logs...');
    const certResult = await tryCertificateAnalysis(cleanUrl);
    if (certResult) {
      console.log(`✅ Found via certificates: ${certResult.provider}`);
      return certResult;
    }
    
    console.log('⚠️ All bypass methods failed');
    return null;
    
  } catch (error) {
    console.error('Error finding real hosting behind Cloudflare:', error);
    return null;
  }
}

// Try to detect origin server through DNS analysis
async function tryOriginServerDetection(domain: string): Promise<HostingResult | null> {
  try {
    // Some sites expose their origin through specific headers or DNS records
    // This is a simplified approach - in practice, this is quite complex
    
    // Check for common origin server headers by trying direct connection bypasses
    const possibleOriginHints = [
      'origin.' + domain,
      'direct.' + domain,
      domain.replace('www.', 'origin.'),
    ];
    
    for (const hint of possibleOriginHints) {
      try {
        const response = await fetch(`https://${hint}`, {
          method: 'HEAD',
          timeout: 5000,
          headers: {
            'User-Agent': 'WebAuditPro/1.0'
          }
        });
        
        if (response.ok) {
          const headers = Object.fromEntries(response.headers.entries());
          const serverHeader = headers.server?.toLowerCase() || '';
          
          // Try to identify hosting provider from server headers
          if (serverHeader.includes('nginx') && headers['x-powered-by']?.includes('digital')) {
            return {
              provider: 'DigitalOcean',
              organization: 'DigitalOcean LLC',
              method: 'dns',
              confidence: 'medium'
            };
          }
        }
      } catch {
        // Continue to next hint
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Analyze response headers for origin server clues
async function tryOriginHeaderAnalysis(url: string): Promise<HostingResult | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'WebAuditPro/1.0',
        // Try to bypass Cloudflare caching
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const headers = Object.fromEntries(response.headers.entries());
    
    // Look for origin server indicators in headers
    const xOriginServer = headers['x-origin-server'] || headers['x-server'];
    const xPoweredBy = headers['x-powered-by']?.toLowerCase() || '';
    const serverInfo = headers['x-server-info']?.toLowerCase() || '';
    
    // Check for hosting provider indicators
    if (xPoweredBy.includes('aws') || serverInfo.includes('aws') || xOriginServer?.includes('aws')) {
      return {
        provider: 'Amazon Web Services (AWS)',
        organization: 'Amazon Web Services Inc.',
        method: 'headers',
        confidence: 'medium'
      };
    }
    
    if (xPoweredBy.includes('digitalocean') || serverInfo.includes('digitalocean')) {
      return {
        provider: 'DigitalOcean',
        organization: 'DigitalOcean LLC',
        method: 'headers',
        confidence: 'medium'
      };
    }
    
    if (xPoweredBy.includes('google') || serverInfo.includes('gcp') || serverInfo.includes('google-cloud')) {
      return {
        provider: 'Google Cloud Platform',
        organization: 'Google LLC',
        method: 'headers',
        confidence: 'medium'
      };
    }
    
    if (xPoweredBy.includes('azure') || serverInfo.includes('azure')) {
      return {
        provider: 'Microsoft Azure',
        organization: 'Microsoft Corporation',
        method: 'headers',
        confidence: 'medium'
      };
    }
    
    // Check for common hosting control panel signatures
    if (xPoweredBy.includes('cpanel') || serverInfo.includes('cpanel')) {
      return {
        provider: 'Shared Hosting (cPanel)',
        organization: 'Traditional Web Host',
        method: 'headers',
        confidence: 'low'
      };
    }
    
    return null;
    
  } catch (error) {
    return null;
  }
}

// Basic certificate transparency analysis
async function tryCertificateAnalysis(domain: string): Promise<HostingResult | null> {
  try {
    // This is a simplified approach. In practice, you'd query CT logs
    // For now, we'll use a free CT log API service
    
    const response = await fetch(`https://crt.sh/?q=${domain}&output=json`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'WebAuditPro/1.0'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const certificates = await response.json();
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return null;
    }
    
    // Look for certificates that might reveal origin server info
    for (const cert of certificates.slice(0, 5)) { // Check first 5 certificates
      const commonName = cert.common_name?.toLowerCase() || '';
      const nameValue = cert.name_value?.toLowerCase() || '';
      
      // Look for hosting provider indicators in certificate names
      if (commonName.includes('aws') || nameValue.includes('amazonaws')) {
        return {
          provider: 'Amazon Web Services (AWS)',
          organization: 'Amazon Web Services Inc.',
          method: 'dns',
          confidence: 'low'
        };
      }
      
      if (commonName.includes('digitalocean') || nameValue.includes('digitalocean')) {
        return {
          provider: 'DigitalOcean',
          organization: 'DigitalOcean LLC',
          method: 'dns',
          confidence: 'low'
        };
      }
      
      if (commonName.includes('gcp') || nameValue.includes('googleusercontent')) {
        return {
          provider: 'Google Cloud Platform',
          organization: 'Google LLC',
          method: 'dns',
          confidence: 'low'
        };
      }
    }
    
    return null;
    
  } catch (error) {
    return null;
  }
}
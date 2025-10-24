// PROFESSIONAL HOSTING COMPANY DETECTION SERVICES
// Implementing IPInfo.io, IPGeolocation.io, and BigDataCloud APIs

interface HostingResult {
  provider?: string;
  organization?: string;
  isp?: string;
  datacenter?: string;
  country?: string;
  source: 'ipinfo' | 'ipgeolocation' | 'bigdatacloud' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
}

// Main hosting detection function with multi-API fallback
export async function detectHostingProvider(domain: string): Promise<HostingResult> {
  try {
    console.log(`🔍 Detecting hosting provider for: ${domain}`);
    
    // First resolve domain to IP address
    const ip = await resolveDomainToIP(domain);
    if (!ip) {
      return { source: 'fallback', confidence: 'low' };
    }
    
    console.log(`📡 Resolved ${domain} to IP: ${ip}`);
    
    // Try APIs in order of preference and free tier limits
    
    // 1. Try IPInfo.io (50,000 free/month - best free tier)
    let result = await tryIPInfoAPI(ip);
    if (result) {
      console.log('✅ Used IPInfo.io API');
      return { ...result, source: 'ipinfo', confidence: 'high' };
    }
    
    // 2. Try BigDataCloud (10,000 free/month - good accuracy)
    result = await tryBigDataCloudAPI(ip);
    if (result) {
      console.log('✅ Used BigDataCloud API');
      return { ...result, source: 'bigdatacloud', confidence: 'high' };
    }
    
    // 3. Try IPGeolocation.io (1,000 free/month - last resort)
    result = await tryIPGeolocationAPI(ip);
    if (result) {
      console.log('✅ Used IPGeolocation.io API');
      return { ...result, source: 'ipgeolocation', confidence: 'medium' };
    }
    
    console.log('⚠️ All hosting APIs failed, using fallback');
    return { source: 'fallback', confidence: 'low' };
    
  } catch (error) {
    console.error('❌ Error in hosting detection:', error);
    return { source: 'fallback', confidence: 'low' };
  }
}

// Resolve domain to IP address using DNS over HTTPS
async function resolveDomainToIP(domain: string): Promise<string | null> {
  try {
    // Clean domain (remove protocol, www, path)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Use Google's DNS over HTTPS service
    const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`, {
      headers: { 'Accept': 'application/dns-json' },
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`DNS resolution failed: ${response.status}`);
    }
    
    const dnsData = await response.json();
    const ip = dnsData.Answer?.[0]?.data;
    
    if (!ip) {
      throw new Error('No A record found');
    }
    
    return ip;
    
  } catch (error) {
    console.error('DNS resolution error:', error);
    return null;
  }
}

// 1. IPInfo.io API integration (50,000 free/month)
async function tryIPInfoAPI(ip: string): Promise<Omit<HostingResult, 'source' | 'confidence'> | null> {
  try {
    const apiKey = process.env.IPINFO_API_KEY;
    const apiUrl = apiKey 
      ? `https://ipinfo.io/${ip}/json?token=${apiKey}`
      : `https://ipinfo.io/${ip}/json`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 8000
    });
    
    if (!response.ok) {
      console.log(`IPInfo.io API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 IPInfo.io response received');
    
    return parseIPInfoResponse(data);
    
  } catch (error) {
    console.error('IPInfo.io API error:', error);
    return null;
  }
}

// 2. IPGeolocation.io API integration (1,000 free/month)
async function tryIPGeolocationAPI(ip: string): Promise<Omit<HostingResult, 'source' | 'confidence'> | null> {
  try {
    const apiKey = process.env.IPGEOLOCATION_API_KEY;
    if (!apiKey) {
      console.log('IPGeolocation.io API key not found - skipping');
      return null;
    }
    
    const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 8000
    });
    
    if (!response.ok) {
      console.log(`IPGeolocation.io API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 IPGeolocation.io response received');
    
    return parseIPGeolocationResponse(data);
    
  } catch (error) {
    console.error('IPGeolocation.io API error:', error);
    return null;
  }
}

// 5. BigDataCloud API integration (10,000 free/month)
async function tryBigDataCloudAPI(ip: string): Promise<Omit<HostingResult, 'source' | 'confidence'> | null> {
  try {
    const apiKey = process.env.BIGDATACLOUD_API_KEY;
    const apiUrl = apiKey
      ? `https://api.bigdatacloud.net/data/ip-geolocation-full?ip=${ip}&key=${apiKey}`
      : `https://api.bigdatacloud.net/data/ip-geolocation?ip=${ip}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'WebAuditPro/1.0' },
      timeout: 8000
    });
    
    if (!response.ok) {
      console.log(`BigDataCloud API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📊 BigDataCloud response received');
    
    return parseBigDataCloudResponse(data);
    
  } catch (error) {
    console.error('BigDataCloud API error:', error);
    return null;
  }
}

// Parse IPInfo.io response
function parseIPInfoResponse(data: any): Omit<HostingResult, 'source' | 'confidence'> {
  const result: Omit<HostingResult, 'source' | 'confidence'> = {};
  
  try {
    if (data.org) {
      // Format: "AS16509 Amazon.com, Inc."
      const orgMatch = data.org.match(/^AS\d+\s+(.+)$/);
      if (orgMatch) {
        result.organization = orgMatch[1];
        result.provider = extractProviderName(orgMatch[1]);
      } else {
        result.organization = data.org;
        result.provider = extractProviderName(data.org);
      }
    }
    
    if (data.hostname) {
      result.datacenter = data.hostname;
    }
    
    if (data.country) {
      result.country = data.country;
    }
    
  } catch (error) {
    console.error('Error parsing IPInfo response:', error);
  }
  
  return result;
}

// Parse IPGeolocation.io response
function parseIPGeolocationResponse(data: any): Omit<HostingResult, 'source' | 'confidence'> {
  const result: Omit<HostingResult, 'source' | 'confidence'> = {};
  
  try {
    if (data.isp) {
      result.isp = data.isp;
      result.provider = extractProviderName(data.isp);
    }
    
    if (data.organization) {
      result.organization = data.organization;
      if (!result.provider) {
        result.provider = extractProviderName(data.organization);
      }
    }
    
    if (data.country_name) {
      result.country = data.country_name;
    }
    
  } catch (error) {
    console.error('Error parsing IPGeolocation response:', error);
  }
  
  return result;
}

// Parse BigDataCloud response
function parseBigDataCloudResponse(data: any): Omit<HostingResult, 'source' | 'confidence'> {
  const result: Omit<HostingResult, 'source' | 'confidence'> = {};
  
  try {
    if (data.network && data.network.organisation) {
      result.organization = data.network.organisation;
      result.provider = extractProviderName(data.network.organisation);
    }
    
    if (data.network && data.network.carrier) {
      result.isp = data.network.carrier;
      if (!result.provider) {
        result.provider = extractProviderName(data.network.carrier);
      }
    }
    
    if (data.country && data.country.name) {
      result.country = data.country.name;
    }
    
    if (data.location && data.location.city) {
      result.datacenter = data.location.city;
    }
    
  } catch (error) {
    console.error('Error parsing BigDataCloud response:', error);
  }
  
  return result;
}

// Extract clean provider name from organization string
function extractProviderName(orgString: string): string {
  if (!orgString) return 'Unknown';

  // Remove common suffixes and clean up
  const provider = orgString
    .replace(/,?\s*(Inc\.?|LLC\.?|Ltd\.?|Corporation|Corp\.?|Limited|Co\.?)$/i, '')
    .replace(/\s+Holdings?$/i, '')
    .replace(/\s+Group$/i, '')
    .replace(/\s+Technologies?$/i, '')
    .trim();
  
  // Map common hosting providers
  const providerMap: Record<string, string> = {
    'Amazon.com': 'Amazon Web Services (AWS)',
    'Amazon': 'Amazon Web Services (AWS)', 
    'Amazon Technologies': 'Amazon Web Services (AWS)',
    'Google': 'Google Cloud Platform',
    'Google LLC': 'Google Cloud Platform',
    'Microsoft Corporation': 'Microsoft Azure',
    'Microsoft': 'Microsoft Azure',
    'DigitalOcean': 'DigitalOcean',
    'Cloudflare': 'Cloudflare',
    'Fastly': 'Fastly CDN',
    'OVH SAS': 'OVH Cloud',
    'Hetzner Online': 'Hetzner',
    'Linode': 'Akamai (Linode)',
    'Vultr Holdings': 'Vultr'
  };
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(providerMap)) {
    if (provider.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return provider;
}

// Export function to get hosting info for display
export async function getHostingInfo(domain: string): Promise<{
  hosting: string;
  organization: string | null;
  source: string;
  confidence: string;
}> {
  const result = await detectHostingProvider(domain);
  
  return {
    hosting: result.provider || 'Not detected',
    organization: result.organization || null,
    source: result.source,
    confidence: result.confidence
  };
}
/**
 * Proxy Service for SERP Scraping
 * Implements rotating proxies and enhanced headers to bypass detection
 */

interface ProxyConfig {
  url: string;
  username?: string;
  password?: string;
  active: boolean;
  lastUsed: number;
  failures: number;
}

interface RequestConfig {
  userAgent: string;
  headers: Record<string, string>;
  proxy?: ProxyConfig;
}

export class ProxyService {
  private userAgents = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    
    // Chrome on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    
    // Firefox on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Safari on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  ];

  private acceptLanguages = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'en-US,en;q=0.9,es;q=0.8',
    'en-GB,en;q=0.9,fr;q=0.8',
    'en-US,en;q=0.9,de;q=0.8'
  ];

  private acceptEncodings = [
    'gzip, deflate, br',
    'gzip, deflate',
    'gzip, deflate, br, zstd'
  ];

  private proxies: ProxyConfig[] = [];
  private currentProxyIndex = 0;
  private lastRequestTime = 0;
  private minDelay = 3000; // 3 seconds minimum between requests

  constructor() {
    this.initializeProxies();
  }

  private initializeProxies() {
    // Free proxy services (these would need to be updated with real proxy endpoints)
    // In production, you'd use services like:
    // - ProxyMesh, Bright Data, Smartproxy, etc.
    
    const freeProxyList = [
      // Note: These are example endpoints - real proxy services would be needed
      // For demo purposes, we'll use different approaches without actual proxies
    ];

    // For now, we'll focus on request rotation without external proxies
    // This still helps with detection avoidance through header rotation
    this.proxies = [];
  }

  getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getRandomAcceptLanguage(): string {
    return this.acceptLanguages[Math.floor(Math.random() * this.acceptLanguages.length)];
  }

  getRandomAcceptEncoding(): string {
    return this.acceptEncodings[Math.floor(Math.random() * this.acceptEncodings.length)];
  }

  generateRandomHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': this.getRandomAcceptLanguage(),
      'Accept-Encoding': this.getRandomAcceptEncoding(),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': this.getRandomUserAgent()
    };

    // Randomly add some optional headers
    if (Math.random() > 0.5) {
      headers['DNT'] = '1';
    }

    if (Math.random() > 0.7) {
      headers['Connection'] = 'keep-alive';
    }

    // Random viewport hints
    const viewports = [
      '1920, 1080',
      '1366, 768',
      '1536, 864',
      '1440, 900',
      '1280, 720'
    ];
    
    if (Math.random() > 0.6) {
      headers['Viewport-Width'] = viewports[Math.floor(Math.random() * viewports.length)].split(', ')[0];
    }

    return headers;
  }

  async enforceDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest;
      // Add random jitter (±500ms)
      const jitter = Math.random() * 1000 - 500;
      const totalDelay = Math.max(0, delayNeeded + jitter);
      
      console.log(`⏱️  Rate limiting: waiting ${Math.round(totalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
    
    this.lastRequestTime = Date.now();
  }

  getRequestConfig(): RequestConfig {
    return {
      userAgent: this.getRandomUserAgent(),
      headers: this.generateRandomHeaders(),
      proxy: this.getNextProxy()
    };
  }

  private getNextProxy(): ProxyConfig | undefined {
    if (this.proxies.length === 0) {
      return undefined;
    }

    // Filter out failed proxies
    const activeProxies = this.proxies.filter(p => p.active && p.failures < 3);
    
    if (activeProxies.length === 0) {
      // Reset all proxy failure counts if all are failed
      this.proxies.forEach(p => p.failures = 0);
      return this.proxies[0];
    }

    // Round-robin through active proxies
    this.currentProxyIndex = (this.currentProxyIndex + 1) % activeProxies.length;
    const proxy = activeProxies[this.currentProxyIndex];
    proxy.lastUsed = Date.now();
    
    return proxy;
  }

  markProxyFailure(proxy: ProxyConfig | undefined) {
    if (proxy) {
      proxy.failures++;
      if (proxy.failures >= 3) {
        proxy.active = false;
        console.log(`❌ Proxy ${proxy.url} marked as inactive after ${proxy.failures} failures`);
      }
    }
  }

  async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    await this.enforceDelay();
    
    const config = this.getRequestConfig();
    
    // Merge headers
    const headers = {
      ...config.headers,
      ...(options.headers as Record<string, string> || {})
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      redirect: 'follow'
    };

    // Add timeout
    if (!requestOptions.signal) {
      requestOptions.signal = AbortSignal.timeout(15000);
    }

    console.log(`🌐 Making request to ${url} with UA: ${config.userAgent.substring(0, 50)}...`);

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        console.log(`⚠️  Request failed with status: ${response.status}`);
      }
      
      return response;
      
    } catch (error) {
      console.log(`❌ Request failed:`, error.message);
      this.markProxyFailure(config.proxy);
      throw error;
    }
  }

  // Advanced search with session simulation
  async makeSearchRequest(query: string, options: {
    location?: string;
    language?: string;
    region?: string;
  } = {}): Promise<Response> {
    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      q: query,
      num: '10',
      hl: options.language || 'en',
      gl: options.region || 'us'
    });

    // Add location if specified
    if (options.location) {
      searchParams.set('near', options.location);
    }

    const searchUrl = `https://www.google.com/search?${searchParams.toString()}`;

    // Add search-specific headers
    const searchHeaders = {
      'Referer': 'https://www.google.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1'
    };

    return this.makeRequest(searchUrl, { headers: searchHeaders });
  }

  // Session management for more realistic browsing
  async simulateSession(): Promise<void> {
    console.log('🎭 Simulating session...');
    
    try {
      // Visit Google homepage first
      await this.makeRequest('https://www.google.com', {
        headers: {
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1'
        }
      });
      
      // Small delay to simulate reading
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
    } catch (error) {
      console.log('Session simulation failed:', error.message);
    }
  }

  getStats() {
    return {
      totalProxies: this.proxies.length,
      activeProxies: this.proxies.filter(p => p.active).length,
      userAgents: this.userAgents.length,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Singleton instance
export const proxyService = new ProxyService();
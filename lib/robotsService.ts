/**
 * Robots.txt Compliance Service
 * Ensures we respect website crawling preferences
 */

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
}

interface RobotsTxtResult {
  allowed: boolean;
  reason?: string;
  crawlDelay?: number;
  sitemaps?: string[];
}

export class RobotsService {
  private static cache = new Map<string, { rules: RobotsRule[]; sitemaps: string[]; timestamp: number }>();
  private static CACHE_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Check if a URL is allowed to be crawled according to robots.txt
   */
  static async isAllowed(
    url: string,
    userAgent: string = 'WebAuditPro'
  ): Promise<RobotsTxtResult> {
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
      const path = urlObj.pathname + urlObj.search;

      // Get robots.txt rules
      const { rules, sitemaps } = await this.fetchRobotsTxt(baseUrl);

      // Find applicable rules for our user agent
      const applicableRules = this.getApplicableRules(rules, userAgent);

      // Check if path is allowed
      const isPathAllowed = this.checkPath(path, applicableRules);

      if (!isPathAllowed) {
        return {
          allowed: false,
          reason: `Disallowed by robots.txt for User-Agent: ${userAgent}`,
          sitemaps
        };
      }

      // Get crawl delay if specified
      const crawlDelay = applicableRules.find(r => r.crawlDelay)?.crawlDelay;

      return {
        allowed: true,
        crawlDelay,
        sitemaps
      };
    } catch (error) {
      // If robots.txt doesn't exist or can't be fetched, allow by default
      console.log(`Robots.txt check failed for ${url}, allowing by default:`, error);
      return { allowed: true };
    }
  }

  /**
   * Fetch and parse robots.txt
   */
  private static async fetchRobotsTxt(baseUrl: string): Promise<{ rules: RobotsRule[]; sitemaps: string[] }> {
    const cacheKey = baseUrl;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Return cached if valid
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return { rules: cached.rules, sitemaps: cached.sitemaps };
    }

    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'WebAuditPro/1.0 (+https://web-audit-pro.com/about)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      // No robots.txt = allow everything
      return { rules: [], sitemaps: [] };
    }

    const text = await response.text();
    const { rules, sitemaps } = this.parseRobotsTxt(text);

    // Cache the result
    this.cache.set(cacheKey, { rules, sitemaps, timestamp: now });

    return { rules, sitemaps };
  }

  /**
   * Parse robots.txt content
   */
  private static parseRobotsTxt(text: string): { rules: RobotsRule[]; sitemaps: string[] } {
    const lines = text.split('\n');
    const rules: RobotsRule[] = [];
    const sitemaps: string[] = [];
    let currentRule: RobotsRule | null = null;

    for (const line of lines) {
      const trimmed = line.split('#')[0].trim(); // Remove comments
      if (!trimmed) continue;

      const [directive, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();

      const directiveLower = directive.toLowerCase();

      if (directiveLower === 'user-agent') {
        if (currentRule) {
          rules.push(currentRule);
        }
        currentRule = {
          userAgent: value.toLowerCase(),
          disallow: [],
          allow: []
        };
      } else if (currentRule) {
        if (directiveLower === 'disallow') {
          if (value) currentRule.disallow.push(value);
        } else if (directiveLower === 'allow') {
          if (value) currentRule.allow.push(value);
        } else if (directiveLower === 'crawl-delay') {
          currentRule.crawlDelay = parseFloat(value);
        }
      } else if (directiveLower === 'sitemap') {
        sitemaps.push(value);
      }
    }

    if (currentRule) {
      rules.push(currentRule);
    }

    return { rules, sitemaps };
  }

  /**
   * Get rules applicable to our user agent
   */
  private static getApplicableRules(rules: RobotsRule[], userAgent: string): RobotsRule[] {
    const userAgentLower = userAgent.toLowerCase();

    // First, try exact match or wildcard
    const exactMatch = rules.filter(r =>
      r.userAgent === userAgentLower || r.userAgent === '*'
    );

    if (exactMatch.length > 0) {
      return exactMatch;
    }

    // Check for partial matches (e.g., "WebAuditPro" matches "webauditpro/1.0")
    const partialMatch = rules.filter(r =>
      userAgentLower.includes(r.userAgent) || r.userAgent.includes(userAgentLower)
    );

    if (partialMatch.length > 0) {
      return partialMatch;
    }

    // Default to wildcard rules
    return rules.filter(r => r.userAgent === '*');
  }

  /**
   * Check if a path is allowed according to rules
   */
  private static checkPath(path: string, rules: RobotsRule[]): boolean {
    // First check Allow rules (they take precedence over Disallow)
    for (const rule of rules) {
      for (const allowPath of rule.allow) {
        if (this.matchPath(path, allowPath)) {
          return true;
        }
      }
    }

    // Then check Disallow rules
    for (const rule of rules) {
      for (const disallowPath of rule.disallow) {
        if (this.matchPath(path, disallowPath)) {
          return false;
        }
      }
    }

    // If no rules matched, allow by default
    return true;
  }

  /**
   * Check if a path matches a robots.txt pattern
   */
  private static matchPath(path: string, pattern: string): boolean {
    // Handle empty pattern
    if (!pattern || pattern === '/') {
      return true;
    }

    // Handle wildcards
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
        .replace(/\*/g, '.*'); // Convert * to .*
      const regex = new RegExp(`^${regexPattern}`);
      return regex.test(path);
    }

    // Simple prefix match
    return path.startsWith(pattern);
  }

  /**
   * Clear the cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

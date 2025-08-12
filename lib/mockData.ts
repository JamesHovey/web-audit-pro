// Simple hash function to create deterministic "random" values based on URL
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Deterministic random number generator
function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
}

// Deterministic float generator
function seededRandomFloat(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return random * (max - min) + min;
}

export function generateMockAuditResults(url: string, sections: string[]) {
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  const seed = hashCode(domain);
  
  const mockResults: any = {};

  if (sections.includes('traffic')) {
    mockResults.traffic = {
      monthlyOrganicTraffic: seededRandom(seed, 5000, 55000),
      monthlyPaidTraffic: seededRandom(seed + 1, 1000, 16000),
      brandedTraffic: seededRandom(seed + 2, 500, 8500),
      topCountries: [
        { country: "United States", percentage: 35.2, traffic: seededRandom(seed + 3, 5000, 25000) },
        { country: "United Kingdom", percentage: 18.7, traffic: seededRandom(seed + 4, 2000, 12000) },
        { country: "Canada", percentage: 12.3, traffic: seededRandom(seed + 5, 1500, 9500) },
        { country: "Australia", percentage: 8.9, traffic: seededRandom(seed + 6, 1000, 6000) },
        { country: "Germany", percentage: 6.1, traffic: seededRandom(seed + 7, 800, 3800) }
      ],
      trafficTrend: [
        { month: "Sep 2024", organic: seededRandom(seed + 8, 35000, 50000), paid: seededRandom(seed + 9, 7000, 9000) },
        { month: "Oct 2024", organic: seededRandom(seed + 10, 30000, 45000), paid: seededRandom(seed + 11, 8000, 10000) },
        { month: "Nov 2024", organic: seededRandom(seed + 12, 40000, 55000), paid: seededRandom(seed + 13, 6000, 8500) },
        { month: "Dec 2024", organic: seededRandom(seed + 14, 45000, 60000), paid: seededRandom(seed + 15, 8000, 9500) },
        { month: "Jan 2025", organic: seededRandom(seed + 16, 42000, 55000), paid: seededRandom(seed + 17, 8500, 10500) },
        { month: "Feb 2025", organic: seededRandom(seed + 18, 48000, 58000), paid: seededRandom(seed + 19, 9000, 11000) }
      ]
    };
  }

  if (sections.includes('keywords')) {
    const brandName = domain.replace('.com', '').replace('www.', '');
    mockResults.keywords = {
      brandedKeywords: seededRandom(seed + 20, 15, 65),
      nonBrandedKeywords: seededRandom(seed + 21, 80, 280),
      topKeywords: [
        { keyword: `${brandName} reviews`, position: seededRandom(seed + 22, 1, 5), volume: seededRandom(seed + 23, 5000, 10000), difficulty: seededRandom(seed + 24, 30, 50) },
        { keyword: `best ${brandName} alternative`, position: seededRandom(seed + 25, 5, 10), volume: seededRandom(seed + 26, 3000, 8000), difficulty: seededRandom(seed + 27, 45, 65) },
        { keyword: `${brandName} pricing`, position: seededRandom(seed + 28, 1, 4), volume: seededRandom(seed + 29, 2000, 5000), difficulty: seededRandom(seed + 30, 25, 45) },
        { keyword: `how to use ${brandName}`, position: seededRandom(seed + 31, 8, 15), volume: seededRandom(seed + 32, 1500, 4000), difficulty: seededRandom(seed + 33, 20, 35) },
        { keyword: `${brandName} vs competitor`, position: seededRandom(seed + 34, 12, 25), volume: seededRandom(seed + 35, 1000, 3000), difficulty: seededRandom(seed + 36, 40, 60) }
      ],
      topCompetitors: [
        { domain: "competitor1.com", overlap: seededRandom(seed + 37, 25, 45), keywords: seededRandom(seed + 38, 100, 200) },
        { domain: "competitor2.com", overlap: seededRandom(seed + 39, 20, 35), keywords: seededRandom(seed + 40, 80, 150) },
        { domain: "competitor3.com", overlap: seededRandom(seed + 41, 15, 30), keywords: seededRandom(seed + 42, 70, 130) },
        { domain: "competitor4.com", overlap: seededRandom(seed + 43, 12, 25), keywords: seededRandom(seed + 44, 60, 120) },
        { domain: "competitor5.com", overlap: seededRandom(seed + 45, 10, 20), keywords: seededRandom(seed + 46, 50, 100) }
      ]
    };
  }

  if (sections.includes('performance')) {
    mockResults.performance = {
      desktop: {
        lcp: seededRandomFloat(seed + 47, 1.2, 3.5).toFixed(1) + 's',
        cls: seededRandomFloat(seed + 48, 0.01, 0.15).toFixed(3),
        inp: seededRandom(seed + 49, 120, 280) + 'ms',
        score: seededRandom(seed + 50, 60, 95),
        status: seededRandom(seed + 51, 1, 10) > 3 ? 'pass' : 'fail'
      },
      mobile: {
        lcp: seededRandomFloat(seed + 52, 2.1, 4.5).toFixed(1) + 's',
        cls: seededRandomFloat(seed + 53, 0.02, 0.2).toFixed(3),
        inp: seededRandom(seed + 54, 180, 400) + 'ms',
        score: seededRandom(seed + 55, 55, 85),
        status: seededRandom(seed + 56, 1, 10) > 4 ? 'pass' : 'fail'
      },
      recommendations: [
        "Optimize images for faster loading",
        "Reduce unused JavaScript",
        "Eliminate render-blocking resources",
        "Use next-gen image formats (WebP, AVIF)",
        "Implement critical CSS inlining"
      ]
    };
  }

  if (sections.includes('backlinks')) {
    mockResults.backlinks = {
      domainAuthority: seededRandom(seed + 57, 35, 85),
      totalBacklinks: seededRandom(seed + 58, 800, 8000),
      referringDomains: seededRandom(seed + 59, 80, 800),
      topBacklinks: [
        { domain: "techcrunch.com", authority: 94, type: "dofollow", anchor: "innovative solution" },
        { domain: "forbes.com", authority: 95, type: "dofollow", anchor: domain },
        { domain: "businessinsider.com", authority: 88, type: "dofollow", anchor: "industry leader" },
        { domain: "wired.com", authority: 89, type: "nofollow", anchor: "latest technology" },
        { domain: "theverge.com", authority: 87, type: "dofollow", anchor: "breakthrough platform" },
        { domain: "reddit.com", authority: 91, type: "nofollow", anchor: domain },
        { domain: "stackoverflow.com", authority: 85, type: "dofollow", anchor: "technical documentation" }
      ]
    };
  }

  if (sections.includes('technical')) {
    mockResults.technical = {
      totalPages: seededRandom(seed + 60, 150, 1500),
      largeImages: seededRandom(seed + 61, 3, 25),
      issues: {
        missingMetaTitles: seededRandom(seed + 62, 0, 12),
        missingMetaDescriptions: seededRandom(seed + 63, 0, 18),
        missingH1Tags: seededRandom(seed + 64, 0, 8),
        missingH2Tags: seededRandom(seed + 65, 0, 25),
        httpErrors: seededRandom(seed + 66, 0, 5),
        brokenLinks: seededRandom(seed + 67, 0, 12)
      },
      sitemapStatus: seededRandom(seed + 68, 1, 10) > 2 ? 'found' : 'missing',
      robotsTxtStatus: seededRandom(seed + 69, 1, 10) > 1 ? 'found' : 'missing',
      httpsStatus: seededRandom(seed + 70, 1, 20) > 1 ? 'secure' : 'insecure',
      imageOptimization: [
        { image: "/hero-banner.jpg", size: "2.3 MB", optimized: "650 KB", savings: "72%" },
        { image: "/product-showcase.png", size: "1.8 MB", optimized: "420 KB", savings: "77%" },
        { image: "/team-photo.jpg", size: "1.2 MB", optimized: "380 KB", savings: "68%" }
      ]
    };
  }

  if (sections.includes('technology')) {
    const frameworks = ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Gatsby'];
    const cms = ['WordPress', 'Drupal', 'Contentful', 'Strapi', 'Ghost'];
    const ecommerce = ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Stripe'];
    const analytics = ['Google Analytics', 'Adobe Analytics', 'Mixpanel', 'Hotjar'];
    const hosting = ['AWS', 'Vercel', 'Netlify', 'Cloudflare', 'DigitalOcean'];

    mockResults.technology = {
      cms: cms[seededRandom(seed + 71, 0, cms.length - 1)],
      framework: frameworks[seededRandom(seed + 72, 0, frameworks.length - 1)],
      ecommerce: seededRandom(seed + 73, 1, 10) > 5 ? ecommerce[seededRandom(seed + 74, 0, ecommerce.length - 1)] : null,
      analytics: analytics[seededRandom(seed + 75, 0, analytics.length - 1)],
      hosting: hosting[seededRandom(seed + 76, 0, hosting.length - 1)],
      technologies: [
        "jQuery 3.6.0",
        "Bootstrap 5.1.3",
        "Font Awesome 6.2.0",
        "Google Fonts",
        "Cloudflare CDN"
      ]
    };
  }

  return mockResults;
}
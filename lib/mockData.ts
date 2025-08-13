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

export async function generateMockAuditResults(url: string, sections: string[]) {
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
    try {
      // Use realistic keyword analysis instead of random generation
      const { analyzeKeywords } = await import('./keywordService');
      
      try {
        // For demonstration, use simulated HTML content based on domain
        const simulatedHtml = generateSimulatedHtml(domain);
        const keywordAnalysis = await analyzeKeywords(domain, simulatedHtml);
        
        mockResults.keywords = {
          brandedKeywords: keywordAnalysis.brandedKeywords || 0,
          nonBrandedKeywords: keywordAnalysis.nonBrandedKeywords || 0,
          brandedKeywordsList: keywordAnalysis.brandedKeywordsList || [],
          nonBrandedKeywordsList: keywordAnalysis.nonBrandedKeywordsList || [],
          topKeywords: keywordAnalysis.topKeywords || [],
          topCompetitors: keywordAnalysis.topCompetitors || []
        };
      } catch (keywordError) {
        console.error('Keyword analysis failed, using fallback:', keywordError);
        throw keywordError; // Re-throw to trigger outer catch
      }
    } catch (error) {
      // Ultimate fallback to basic generation if everything fails
      console.error('All keyword analysis failed, using basic fallback:', error);
      const brandName = domain?.replace('.com', '')?.replace('www.', '')?.replace('.co.uk', '') || 'Brand';
      mockResults.keywords = {
        brandedKeywords: seededRandom(seed + 20, 15, 25),
        nonBrandedKeywords: seededRandom(seed + 21, 40, 80),
        brandedKeywordsList: [
          { keyword: `${brandName}`, position: 1, volume: seededRandom(seed + 22, 200, 500), difficulty: 20, type: 'branded' },
          { keyword: `${brandName} reviews`, position: seededRandom(seed + 23, 1, 5), volume: seededRandom(seed + 24, 150, 400), difficulty: 25, type: 'branded' },
          { keyword: `${brandName} services`, position: seededRandom(seed + 25, 2, 8), volume: seededRandom(seed + 26, 100, 300), difficulty: 30, type: 'branded' }
        ],
        nonBrandedKeywordsList: [
          { keyword: 'professional services', position: 8, volume: 1200, difficulty: 55, type: 'non-branded' },
          { keyword: 'business consulting', position: 12, volume: 800, difficulty: 48, type: 'non-branded' },
          { keyword: 'expert advice', position: 15, volume: 600, difficulty: 42, type: 'non-branded' }
        ],
        topKeywords: [
          { keyword: 'professional services', position: 8, volume: 1200, difficulty: 55, type: 'non-branded' },
          { keyword: `${brandName} reviews`, position: seededRandom(seed + 27, 1, 5), volume: seededRandom(seed + 28, 150, 400), difficulty: 25, type: 'branded' },
          { keyword: 'business consulting', position: 12, volume: 800, difficulty: 48, type: 'non-branded' },
          { keyword: `${brandName} services`, position: seededRandom(seed + 29, 2, 8), volume: seededRandom(seed + 30, 100, 300), difficulty: 30, type: 'branded' }
        ],
        topCompetitors: [
          { domain: "competitor1.com", overlap: seededRandom(seed + 31, 25, 45), keywords: seededRandom(seed + 32, 50, 150), authority: seededRandom(seed + 33, 40, 70), description: "Digital marketing competitor" },
          { domain: "competitor2.com", overlap: seededRandom(seed + 34, 20, 35), keywords: seededRandom(seed + 35, 40, 120), authority: seededRandom(seed + 36, 35, 65), description: "Marketing services provider" },
          { domain: "competitor3.com", overlap: seededRandom(seed + 37, 15, 30), keywords: seededRandom(seed + 38, 30, 100), authority: seededRandom(seed + 39, 30, 60), description: "Business consultancy firm" }
        ]
      };
    }
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

function generateSimulatedHtml(domain: string): string {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const brandName = cleanDomain.split('.')[0];
  const isUK = domain.includes('.co.uk');
  
  // Create realistic HTML content based on domain type
  let htmlContent = `
    <html>
    <head>
      <title>${brandName.charAt(0).toUpperCase() + brandName.slice(1)} - Professional Services</title>
      <meta name="description" content="Professional services provided by ${brandName}">
    </head>
    <body>
      <h1>Welcome to ${brandName.charAt(0).toUpperCase() + brandName.slice(1)}</h1>
      <p>We are a leading provider of professional services</p>
  `;
  
  // Add UK-specific content for .co.uk domains
  if (isUK) {
    htmlContent += `
      <p>Based in London, UK, we serve clients across England, Scotland, and Wales.</p>
      <p>Contact us: +44 20 7123 4567</p>
      <p>VAT Number: GB123456789</p>
      <p>Registered in England and Wales. Company Number: 12345678</p>
      <p>Address: 123 London Street, London, EC1A 1AA</p>
    `;
  }
  
  // Add marketing-specific content for pmwcom.co.uk style domains
  if (brandName.toLowerCase().includes('pmw') || brandName.toLowerCase().includes('marketing')) {
    htmlContent += `
      <h2>Marketing Services</h2>
      <p>Digital marketing agency specializing in brand strategy, content marketing, and advertising.</p>
      <p>Our services include social media marketing, email marketing, and PPC management.</p>
      <p>We help businesses grow through innovative marketing solutions.</p>
      <h3>About Our Agency</h3>
      <p>Professional marketing consultants with years of experience.</p>
      <p>Award-winning creative team delivering results for our clients.</p>
    `;
  } else {
    // Generic business content
    htmlContent += `
      <h2>Our Services</h2>
      <p>We provide professional consulting services to businesses.</p>
      <p>Our team of experts helps clients achieve their goals.</p>
      <h3>About Us</h3>
      <p>Established company with a proven track record.</p>
      <p>Contact us for a consultation.</p>
    `;
  }
  
  htmlContent += `
      <footer>
        <p>© 2024 ${brandName.charAt(0).toUpperCase() + brandName.slice(1)}. All rights reserved.</p>
        <p>Privacy Policy | Terms & Conditions</p>
      </footer>
    </body>
    </html>
  `;
  
  return htmlContent;
}
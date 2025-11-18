/**
 * Manual Fix Instructions
 * Provides step-by-step manual instructions for fixing common SEO and performance issues
 * Used alongside plugin recommendations for non-WordPress sites or users preferring manual fixes
 */

export interface ManualFixInstruction {
  issueType: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTime: string;
  steps: string[];
  codeExample?: string;
  resources?: Array<{
    title: string;
    url: string;
  }>;
  warnings?: string[];
}

export const MANUAL_FIX_INSTRUCTIONS: Record<string, ManualFixInstruction> = {
  'title-length': {
    issueType: 'title-length',
    title: 'Fix Title Tag Length Issues',
    difficulty: 'Easy',
    estimatedTime: '5-10 minutes per page',
    steps: [
      'Review pages with title length issues from the table',
      'For short titles (< 30 chars): Expand with descriptive keywords',
      'For long titles (> 70 chars): Remove unnecessary words and focus on key terms',
      'Include your primary keyword near the beginning',
      'Make titles compelling to encourage clicks',
      'Ensure each title is unique across your site',
      'Update the <title> tag in your page\'s <head> section',
      'Verify changes using Google\'s Rich Results Test'
    ],
    codeExample: `<!-- Too Short Title (Bad - 18 chars) -->
<title>About Our Company</title>

<!-- Optimal Title (Good - 54 chars) -->
<title>About PMW Communications - Award-Winning Marketing Agency</title>

<!-- Too Long Title (Bad - 78 chars) -->
<title>About PMW Communications - Award-Winning Full-Service Marketing Agency in Sussex</title>

<!-- Shortened Title (Good - 63 chars) -->
<title>About PMW Communications - Marketing Agency in Sussex</title>`,
    resources: [
      {
        title: 'Google: Create good titles and snippets',
        url: 'https://developers.google.com/search/docs/appearance/title-link'
      },
      {
        title: 'Moz: Title Tag Best Practices',
        url: 'https://moz.com/learn/seo/title-tag'
      }
    ],
    warnings: [
      'Avoid keyword stuffing - write for humans first',
      'Don\'t use all caps or excessive punctuation',
      'Make sure titles accurately describe the page content',
      'Each page should have a unique title'
    ]
  },

  'internal-linking': {
    issueType: 'internal-linking',
    title: 'Add Internal Links Manually',
    difficulty: 'Easy',
    estimatedTime: '15-30 minutes per page',
    steps: [
      'Identify pages with low internal link counts from the table above',
      'Review the content on each page and identify relevant topics',
      'Find other pages on your site that discuss related topics',
      'Add 2-5 contextual links from related pages pointing to the low-linked page',
      'Use descriptive anchor text (avoid "click here" - use keywords instead)',
      'Link from high-authority pages (homepage, popular blog posts) when possible',
      'Update your sitemap.xml after adding links'
    ],
    codeExample: `<!-- Good internal link example -->
<p>Learn more about our <a href="/services/seo">SEO services</a> to improve your rankings.</p>

<!-- Avoid generic anchor text -->
<p>Want to learn more? <a href="/services/seo">Click here</a>.</p>`,
    resources: [
      {
        title: 'Google: Internal Linking Best Practices',
        url: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable'
      },
      {
        title: 'Moz: Internal Linking Guide',
        url: 'https://moz.com/learn/seo/internal-link'
      }
    ],
    warnings: [
      'Don\'t overdo it - 2-5 internal links per page is ideal',
      'Make sure links are relevant and add value to the reader',
      'Avoid linking the same keyword to multiple pages (can confuse search engines)'
    ]
  },

  '404-errors': {
    issueType: '404-errors',
    title: 'Fix 404 Errors with Redirects',
    difficulty: 'Medium',
    estimatedTime: '5-10 minutes per redirect',
    steps: [
      'Review the 404 errors table to identify broken pages',
      'For each 404 page, decide: delete, restore, or redirect',
      'If the page moved, create a 301 redirect to the new URL',
      'If the page was deleted, redirect to a relevant similar page',
      'Update internal links pointing to 404 pages',
      'Add redirects to your .htaccess (Apache) or server config (Nginx)',
      'Test each redirect to ensure it works correctly',
      'Monitor for new 404 errors regularly'
    ],
    codeExample: `# Apache .htaccess redirect examples
# Redirect single page
Redirect 301 /old-page /new-page

# Redirect entire directory
RedirectMatch 301 ^/old-directory/(.*) /new-directory/$1

# Nginx redirect example (in server block)
location /old-page {
    return 301 /new-page;
}`,
    resources: [
      {
        title: 'Apache mod_rewrite Documentation',
        url: 'https://httpd.apache.org/docs/current/mod/mod_rewrite.html'
      },
      {
        title: 'Nginx Redirect Guide',
        url: 'https://www.nginx.com/blog/creating-nginx-rewrite-rules/'
      },
      {
        title: 'Google: HTTP Status Codes',
        url: 'https://developers.google.com/search/docs/crawling-indexing/http-network-errors'
      }
    ],
    warnings: [
      'Always use 301 (permanent) redirects for SEO, not 302 (temporary)',
      'Avoid redirect chains (A→B→C) - redirect directly (A→C)',
      'Test redirects in incognito mode to avoid browser caching',
      'Backup your .htaccess file before making changes'
    ]
  },

  'structured-data': {
    issueType: 'structured-data',
    title: 'Add or Fix Structured Data Markup',
    difficulty: 'Advanced',
    estimatedTime: '30-60 minutes per page',
    steps: [
      'Identify which schema types are appropriate for your content (Article, Product, Organization, etc.)',
      'Use Google\'s Structured Data Markup Helper to generate schema',
      'Add JSON-LD script to the <head> section of your page',
      'Include all required properties for your schema type',
      'Validate your markup using Google\'s Rich Results Test',
      'Fix any errors or warnings reported by the validator',
      'Deploy changes and request reindexing in Google Search Console',
      'Monitor rich results appearance in search'
    ],
    codeExample: `<!-- Article Schema Example -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Site Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.jpg"
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-18"
}
</script>`,
    resources: [
      {
        title: 'Google: Structured Data Guidelines',
        url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data'
      },
      {
        title: 'Schema.org Types',
        url: 'https://schema.org/docs/schemas.html'
      },
      {
        title: 'Google Rich Results Test',
        url: 'https://search.google.com/test/rich-results'
      },
      {
        title: 'Structured Data Markup Helper',
        url: 'https://www.google.com/webmasters/markup-helper/'
      }
    ],
    warnings: [
      'Don\'t add misleading markup - only mark up content that\'s visible on the page',
      'Include all required properties to avoid validation errors',
      'Use JSON-LD format (preferred by Google) over Microdata or RDFa',
      'Test thoroughly before deploying to production'
    ]
  },

  'unminified-files': {
    issueType: 'unminified-files',
    title: 'Minify JavaScript and CSS Files',
    difficulty: 'Medium',
    estimatedTime: '20-40 minutes',
    steps: [
      'Identify unminified JavaScript and CSS files from the table',
      'For build tool users: Enable minification in your build process (Webpack, Vite, etc.)',
      'For manual minification: Use online tools like JSCompress or CSS Minifier',
      'Download minified versions and rename with .min.js or .min.css extension',
      'Update HTML references to point to minified versions',
      'Test your site thoroughly to ensure nothing broke',
      'Set up automatic minification in your build pipeline for future files'
    ],
    codeExample: `<!-- Update references to use minified files -->
<!-- Before -->
<script src="/js/main.js"></script>
<link rel="stylesheet" href="/css/style.css">

<!-- After -->
<script src="/js/main.min.js"></script>
<link rel="stylesheet" href="/css/style.min.css">

<!-- Build tools configuration examples -->
// Webpack (webpack.config.js)
module.exports = {
  mode: 'production', // Automatically minifies
  optimization: {
    minimize: true
  }
};

// Vite (vite.config.js)
export default {
  build: {
    minify: 'terser' // or 'esbuild'
  }
};`,
    resources: [
      {
        title: 'JSCompress - JavaScript Minifier',
        url: 'https://jscompress.com/'
      },
      {
        title: 'CSS Minifier',
        url: 'https://cssminifier.com/'
      },
      {
        title: 'Webpack Production Build',
        url: 'https://webpack.js.org/guides/production/'
      },
      {
        title: 'Google: Minify Resources',
        url: 'https://developers.google.com/speed/docs/insights/MinifyResources'
      }
    ],
    warnings: [
      'Always keep original unminified files for development',
      'Test minified files thoroughly - minification can sometimes break code',
      'Don\'t minify third-party libraries that are already minified',
      'Use source maps for debugging minified code in production'
    ]
  }
};

/**
 * Get manual fix instructions for a specific issue type
 */
export function getManualFixInstructions(issueType: string): ManualFixInstruction | undefined {
  return MANUAL_FIX_INSTRUCTIONS[issueType];
}

/**
 * Get all manual fix instructions
 */
export function getAllManualFixInstructions(): ManualFixInstruction[] {
  return Object.values(MANUAL_FIX_INSTRUCTIONS);
}

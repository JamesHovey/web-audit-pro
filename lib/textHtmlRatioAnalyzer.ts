// Text-to-HTML Ratio Analyzer
// Measures the ratio of visible text content to HTML code

export interface TextHtmlRatioResult {
  textLength: number;
  htmlLength: number;
  ratio: number; // Percentage (0-100)
  status: 'good' | 'warning' | 'poor';
}

export interface PageTextHtmlRatio {
  url: string;
  textLength: number;
  htmlLength: number;
  ratio: number;
  status: 'good' | 'warning' | 'poor';
}

/**
 * Extract visible text content from HTML
 * Removes script, style, and other non-visible elements
 */
function extractVisibleText(html: string): string {
  let text = html;

  // Remove script tags and their content
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove head tag and its content
  text = text.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');

  // Remove noscript tags
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Remove iframe tags
  text = text.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove SVG tags
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Calculate text-to-HTML ratio for a single page
 */
export function calculateTextHtmlRatio(html: string): TextHtmlRatioResult {
  // Get visible text
  const visibleText = extractVisibleText(html);
  const textLength = visibleText.length;

  // Get total HTML length
  const htmlLength = html.length;

  // Calculate ratio as percentage
  const ratio = htmlLength > 0 ? (textLength / htmlLength) * 100 : 0;

  // Determine status based on ratio
  // Industry standards:
  // Good: > 25%
  // Warning: 15-25%
  // Poor: < 15%
  let status: 'good' | 'warning' | 'poor';
  if (ratio >= 25) {
    status = 'good';
  } else if (ratio >= 15) {
    status = 'warning';
  } else {
    status = 'poor';
  }

  return {
    textLength,
    htmlLength,
    ratio: Math.round(ratio * 10) / 10, // Round to 1 decimal place
    status
  };
}

/**
 * Analyze multiple pages for text-to-HTML ratio issues
 */
export function analyzePagesTextHtmlRatio(
  pages: Array<{ url: string; html?: string }>
): {
  totalPages: number;
  pagesWithLowRatio: number;
  pages: PageTextHtmlRatio[];
} {
  const results: PageTextHtmlRatio[] = [];
  let pagesWithLowRatio = 0;

  for (const page of pages) {
    if (!page.html) continue;

    const ratioResult = calculateTextHtmlRatio(page.html);

    results.push({
      url: page.url,
      textLength: ratioResult.textLength,
      htmlLength: ratioResult.htmlLength,
      ratio: ratioResult.ratio,
      status: ratioResult.status
    });

    // Count pages with warning or poor status
    if (ratioResult.status === 'warning' || ratioResult.status === 'poor') {
      pagesWithLowRatio++;
    }
  }

  return {
    totalPages: pages.length,
    pagesWithLowRatio,
    pages: results
  };
}

/**
 * Get recommendations for improving text-to-HTML ratio
 */
export function getTextHtmlRatioRecommendations(ratio: number): string[] {
  const recommendations: string[] = [];

  if (ratio < 15) {
    recommendations.push('Critical: Very low text-to-HTML ratio indicates thin content or excessive code');
    recommendations.push('Add more substantial, unique content to your pages');
    recommendations.push('Review and remove unnecessary HTML, inline CSS, and JavaScript');
    recommendations.push('Consider moving CSS to external stylesheets');
    recommendations.push('Minify HTML and remove code comments in production');
  } else if (ratio < 25) {
    recommendations.push('Your text-to-HTML ratio could be improved');
    recommendations.push('Add more meaningful content where appropriate');
    recommendations.push('Optimize your HTML structure');
    recommendations.push('Move inline styles and scripts to external files');
  } else {
    recommendations.push('Good text-to-HTML ratio maintained');
  }

  return recommendations;
}

/**
 * Unminified JavaScript and CSS File Detection Service
 * Detects unminified files to match SEMrush functionality
 */

export interface UnminifiedFile {
  url: string;
  type: 'javascript' | 'css';
  sizeKB?: number;
  reason: string;
}

export interface UnminifiedFilesResult {
  totalUnminified: number;
  javascriptFiles: UnminifiedFile[];
  cssFiles: UnminifiedFile[];
}

/**
 * Check if a file URL indicates it's minified
 */
function isMinifiedByFilename(url: string): boolean {
  const urlLower = url.toLowerCase();

  // Check for .min.js or .min.css in the filename
  if (urlLower.includes('.min.js') || urlLower.includes('.min.css')) {
    return true;
  }

  // Some build tools use different patterns
  if (urlLower.match(/\.[a-f0-9]{8,}\.(js|css)$/)) {
    // Hash-based filenames (like webpack) are usually minified
    return true;
  }

  return false;
}

/**
 * Check if file content appears to be minified
 */
function isMinifiedByContent(content: string, type: 'javascript' | 'css'): boolean {
  // Remove first 500 characters and check a sample (to avoid large file analysis)
  const sample = content.substring(0, 2000);

  // Count newlines - minified files have very few line breaks
  const newlineCount = (sample.match(/\n/g) || []).length;
  const avgLineLength = sample.length / (newlineCount + 1);

  // Minified files typically have:
  // - Very long lines (>500 chars average)
  // - Few newlines
  // - No indentation

  if (avgLineLength > 500) {
    return true;
  }

  // Check for common minification patterns
  if (type === 'javascript') {
    // Minified JS often has patterns like: "}(window,document);" or "!function()"
    if (sample.match(/[;}]\(window|!function\(|}\(this,|function\(\)\{/)) {
      return true;
    }
  } else if (type === 'css') {
    // Minified CSS has no spaces after colons and semicolons
    if (sample.match(/[a-z]:[a-z0-9#]/i) && !sample.includes('\n  ')) {
      return true;
    }
  }

  // Check indentation - minified files have none
  const indentedLines = (sample.match(/\n[ \t]+/g) || []).length;
  const totalLines = newlineCount;

  if (totalLines > 5 && indentedLines / totalLines < 0.1) {
    // Less than 10% of lines are indented - likely minified
    return true;
  }

  return false;
}

/**
 * Extract JavaScript file URLs from HTML
 */
function extractJavaScriptFiles(html: string, baseUrl: string): string[] {
  const jsFiles: string[] = [];

  // Match <script src="...">
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    let url = match[1];

    // Skip inline scripts, data URLs, and certain CDN files that are always minified
    if (url.startsWith('data:') || url.startsWith('javascript:')) {
      continue;
    }

    // Convert relative URLs to absolute
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
    } else if (!url.startsWith('http')) {
      // Relative path
      url = new URL(url, baseUrl).href;
    }

    jsFiles.push(url);
  }

  return jsFiles;
}

/**
 * Extract CSS file URLs from HTML
 */
function extractCSSFiles(html: string, baseUrl: string): string[] {
  const cssFiles: string[] = [];

  // Match <link rel="stylesheet" href="...">
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let url = match[1] || match[2];

    // Skip data URLs
    if (url.startsWith('data:')) {
      continue;
    }

    // Convert relative URLs to absolute
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
    } else if (!url.startsWith('http')) {
      url = new URL(url, baseUrl).href;
    }

    cssFiles.push(url);
  }

  return cssFiles;
}

/**
 * Fetch and analyze a file to determine if it's minified
 */
async function analyzeFile(url: string, type: 'javascript' | 'css'): Promise<UnminifiedFile | null> {
  try {
    // First check filename
    if (isMinifiedByFilename(url)) {
      return null; // File is minified
    }

    // For external CDN files, trust that they're minified
    const cdnPatterns = [
      'cdnjs.cloudflare.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'ajax.googleapis.com',
      'code.jquery.com',
      'stackpath.bootstrapcdn.com',
      'maxcdn.bootstrapcdn.com'
    ];

    if (cdnPatterns.some(cdn => url.includes(cdn))) {
      return null; // Assume CDN files are minified
    }

    // Try to fetch file content (with timeout and size limit)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Web-Audit-Pro/1.0)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Can't fetch file, assume it's a problem but don't count as unminified
      return null;
    }

    // Get file size
    const contentLength = response.headers.get('content-length');
    const sizeKB = contentLength ? Math.round(parseInt(contentLength) / 1024) : undefined;

    // Only analyze files under 500KB to avoid memory issues
    if (sizeKB && sizeKB > 500) {
      // Large file without .min in name is likely unminified, but we'll skip analysis
      return {
        url,
        type,
        sizeKB,
        reason: 'Large file without .min in filename'
      };
    }

    // Get file content
    const content = await response.text();

    // Analyze content
    if (isMinifiedByContent(content, type)) {
      return null; // File is minified
    }

    // File appears to be unminified
    return {
      url,
      type,
      sizeKB,
      reason: 'File contains unminified code (whitespace, comments, or formatting detected)'
    };

  } catch (error) {
    // If we can't fetch/analyze, don't count it
    console.log(`Could not analyze file ${url}:`, error);
    return null;
  }
}

/**
 * Detect unminified JavaScript and CSS files on a page
 */
export async function detectUnminifiedFiles(html: string, pageUrl: string): Promise<UnminifiedFilesResult> {
  console.log(`🔍 Scanning for unminified JS/CSS files on ${pageUrl}`);

  // Extract file URLs from HTML
  const jsUrls = extractJavaScriptFiles(html, pageUrl);
  const cssUrls = extractCSSFiles(html, pageUrl);

  console.log(`Found ${jsUrls.length} JavaScript files and ${cssUrls.length} CSS files`);

  // Analyze files in parallel (but limit concurrency to avoid overwhelming)
  const BATCH_SIZE = 3;
  const unminifiedJS: UnminifiedFile[] = [];
  const unminifiedCSS: UnminifiedFile[] = [];

  // Analyze JavaScript files
  for (let i = 0; i < jsUrls.length; i += BATCH_SIZE) {
    const batch = jsUrls.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(url => analyzeFile(url, 'javascript'))
    );

    results.forEach(result => {
      if (result) {
        unminifiedJS.push(result);
      }
    });
  }

  // Analyze CSS files
  for (let i = 0; i < cssUrls.length; i += BATCH_SIZE) {
    const batch = cssUrls.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(url => analyzeFile(url, 'css'))
    );

    results.forEach(result => {
      if (result) {
        unminifiedCSS.push(result);
      }
    });
  }

  console.log(`✅ Found ${unminifiedJS.length} unminified JavaScript files and ${unminifiedCSS.length} unminified CSS files`);

  return {
    totalUnminified: unminifiedJS.length + unminifiedCSS.length,
    javascriptFiles: unminifiedJS,
    cssFiles: unminifiedCSS
  };
}

/**
 * Get a filename from a URL for display
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || pathname;
    return filename || url;
  } catch {
    return url;
  }
}

/**
 * WordPress Plugin Configuration Steps
 * Provides step-by-step instructions for configuring WordPress plugins to fix specific issues
 */

export interface PluginConfigurationSteps {
  pluginSlug: string;
  issueType: string;
  steps: string[];
  screenshots?: string[];
  videoUrl?: string;
  estimatedTime: string;
}

// Map of plugin slugs to configuration steps for different issue types
export const WORDPRESS_PLUGIN_STEPS: Record<string, Record<string, PluginConfigurationSteps>> = {
  // Yoast SEO configurations
  'wordpress-seo': {
    'meta-titles': {
      pluginSlug: 'wordpress-seo',
      issueType: 'meta-titles',
      estimatedTime: '2-3 minutes per page',
      steps: [
        'Go to the page/post that needs a meta title',
        'Scroll down to the "Yoast SEO" meta box below the editor',
        'Find the "SEO title" field',
        'Enter your optimized title (30-60 characters)',
        'Yoast shows a preview of how it appears in Google',
        'Green bullet = good length, Orange = too short/long',
        'Click "Update" or "Publish" to save',
        'Repeat for all pages without titles'
      ]
    },
    'meta-descriptions': {
      pluginSlug: 'wordpress-seo',
      issueType: 'meta-descriptions',
      estimatedTime: '2-3 minutes per page',
      steps: [
        'Go to the page/post that needs a meta description',
        'Scroll down to the "Yoast SEO" meta box',
        'Find the "Meta description" field',
        'Write a compelling description (150-160 characters)',
        'Include your target keyword naturally',
        'Yoast shows character count and preview',
        'Green bullet = optimal length',
        'Click "Update" or "Publish" to save'
      ]
    },
    'title-length': {
      pluginSlug: 'wordpress-seo',
      issueType: 'title-length',
      estimatedTime: '1-2 minutes per page',
      steps: [
        'Navigate to the page with title length issue',
        'Open Yoast SEO meta box below editor',
        'Look at the "SEO title" preview bar',
        'Orange/red indicator = title too short or too long',
        'Edit title to 30-60 characters (green zone)',
        'Yoast live-updates the color indicator',
        'Save the page when green',
        'Bulk edit: SEO → Search Appearance → Content Types'
      ]
    },
    'schema-markup': {
      pluginSlug: 'wordpress-seo',
      issueType: 'schema-markup',
      estimatedTime: '5-10 minutes',
      steps: [
        'Go to SEO → Search Appearance in WordPress admin',
        'Click on "Content Types" tab',
        'Select post type (Posts, Pages, etc.)',
        'Scroll to "Schema" section',
        'Enable "Show schema markup"',
        'Choose schema type (Article, WebPage, etc.)',
        'Save changes',
        'For advanced schema: SEO → Schema → Add Schema',
        'Premium version needed for full schema support'
      ]
    }
  },

  // Rank Math configurations
  'seo-by-rank-math': {
    'meta-titles': {
      pluginSlug: 'seo-by-rank-math',
      issueType: 'meta-titles',
      estimatedTime: '2-3 minutes per page',
      steps: [
        'Edit the page/post needing a title',
        'Find "Rank Math SEO" meta box below editor',
        'Click on it to expand options',
        'Enter title in "SEO Title" field',
        'Rank Math shows live Google preview',
        'Aim for 30-60 characters (green zone)',
        'Use variables like %title% or %sitename% for templates',
        'Save the page'
      ]
    },
    '404-errors': {
      pluginSlug: 'seo-by-rank-math',
      issueType: '404-errors',
      estimatedTime: '5 minutes per redirect',
      steps: [
        'Go to Rank Math → Redirections in admin',
        'Click "Add New" redirection',
        'Enter the 404 URL in "Source URLs" (without domain)',
        'Example: /old-page',
        'Enter destination in "Destination URL"',
        'Select "301 Permanent" as redirection type',
        'Click "Add Redirection"',
        'Rank Math automatically tracks 404s in Monitor tab'
      ]
    },
    'schema-markup': {
      pluginSlug: 'seo-by-rank-math',
      issueType: 'schema-markup',
      estimatedTime: '3-5 minutes',
      steps: [
        'Edit the page/post that needs schema',
        'In Rank Math meta box, click "Schema" tab',
        'Click "Add New Schema"',
        'Choose schema type (Article, Product, Review, etc.)',
        'Fill in required fields (marked with *)',
        'Optional: Add more schema types to same page',
        'Save page',
        'Verify: Use Google Rich Results Test tool'
      ]
    },
    'internal-linking': {
      pluginSlug: 'seo-by-rank-math',
      issueType: 'internal-linking',
      estimatedTime: '10-15 minutes setup',
      steps: [
        'Go to Rank Math → General Settings',
        'Click on "Links" tab',
        'Enable "Add links to pages/posts automatically"',
        'Set "Maximum links per post" (3-5 recommended)',
        'Enable "Open external links in new tab/window"',
        'Enable "Add nofollow to external links" if desired',
        'Save settings',
        'Rank Math will automatically add internal links',
        'Manual: Use link suggestion box in editor'
      ]
    }
  },

  // Image optimization plugins
  'imagify': {
    'large-images': {
      pluginSlug: 'imagify',
      issueType: 'large-images',
      estimatedTime: '10 minutes initial setup + bulk optimization time',
      steps: [
        'Go to Settings → Imagify in WordPress admin',
        'Enter your API key (free account: imagify.io)',
        'Choose optimization level: "Aggressive" for max compression',
        'Enable "Auto-Optimize images on upload"',
        'Enable "Create WebP versions of images"',
        'Enable "Display images in WebP format"',
        'Click "Save Changes"',
        'Go to Media → Bulk Optimization',
        'Click "Imagify All" to optimize existing images',
        'Wait for optimization to complete'
      ]
    }
  },

  'shortpixel-image-optimiser': {
    'large-images': {
      pluginSlug: 'shortpixel-image-optimiser',
      issueType: 'large-images',
      estimatedTime: '5 minutes setup',
      steps: [
        'Go to Settings → ShortPixel in admin',
        'Enter API key (free: 100 images/month from shortpixel.com)',
        'Select compression type: "Lossy" (recommended)',
        'Check "Also create WebP versions"',
        'Check "Deliver the next generation versions"',
        'Set "Resize large images" to 2000px width max',
        'Click "Save Settings"',
        'Go to Media → Bulk ShortPixel',
        'Click "Optimize Now" to process existing images'
      ]
    }
  },

  // Caching plugins
  'wp-rocket': {
    'unminified-files': {
      pluginSlug: 'wp-rocket',
      issueType: 'unminified-files',
      estimatedTime: '5 minutes',
      steps: [
        'Go to Settings → WP Rocket',
        'Click "File Optimization" tab',
        'Under CSS: Check "Minify CSS files"',
        'Check "Combine CSS files" (if compatible)',
        'Under JavaScript: Check "Minify JavaScript files"',
        'Optional: "Combine JavaScript" (test carefully - can break sites)',
        'Enable "Load JavaScript deferred"',
        'Click "Save Changes"',
        'Clear cache: Click "Clear Cache" button at top',
        'Test your site thoroughly after enabling'
      ]
    },
    'caching': {
      pluginSlug: 'wp-rocket',
      issueType: 'caching',
      estimatedTime: '3 minutes',
      steps: [
        'WP Rocket activates caching automatically on install',
        'Go to Settings → WP Rocket',
        'Caching is enabled by default - nothing to configure!',
        'Optional: Enable "Mobile Cache" under Cache tab',
        'Enable "User Cache" if you have logged-in users',
        'Under "Cache Lifespan" - keep default (10 hours)',
        'Save changes',
        'Clear cache to start fresh'
      ]
    }
  },

  'autoptimize': {
    'unminified-files': {
      pluginSlug: 'autoptimize',
      issueType: 'unminified-files',
      estimatedTime: '5-10 minutes',
      steps: [
        'Go to Settings → Autoptimize',
        'Under "JavaScript Options": Check "Optimize JavaScript Code"',
        'Under "CSS Options": Check "Optimize CSS Code"',
        'Check "Aggregate CSS-files"',
        'Under "HTML Options": Check "Optimize HTML Code"',
        'Click "Save Changes and Empty Cache"',
        'Test your site - if broken, try:',
        '  - Exclude jQuery: Add "jquery" to JS exclusions',
        '  - Disable "Aggregate JavaScript files" if issues persist',
        'Recommended: Use with caching plugin for best results'
      ]
    }
  },

  // Redirect plugins
  'redirection': {
    '404-errors': {
      pluginSlug: 'redirection',
      issueType: '404-errors',
      estimatedTime: '2-3 minutes per redirect',
      steps: [
        'Go to Tools → Redirection in WordPress admin',
        'Go to "Redirects" tab',
        'Click "Add New" at top',
        'In "Source URL" enter the 404 URL (without domain)',
        'Example: /old-page (not http://example.com/old-page)',
        'In "Target URL" enter where it should redirect',
        'Leave "Type" as "301 - Moved Permanently"',
        'Click "Add Redirect"',
        'View 404 errors: Click "404s" tab to see all 404s',
        'Bulk add from 404 log: Click "Add Redirect" next to each 404'
      ]
    },
    'permanent-redirects': {
      pluginSlug: 'redirection',
      issueType: 'permanent-redirects',
      estimatedTime: '5-10 minutes',
      steps: [
        'Go to Tools → Redirection',
        'Review existing redirects in "Redirects" tab',
        'Check "Last Access" column - old redirects can be removed',
        'Update internal links to avoid redirects:',
        '  - Note common redirect sources',
        '  - Update those links in your content to point directly',
        'Check for redirect chains in "Groups" tab',
        'Monitor redirect performance in "Log" tab',
        'Export redirects: Options → Import/Export'
      ]
    }
  },

  // Schema plugins
  'schema-and-structured-data-for-wp': {
    'schema-markup': {
      pluginSlug: 'schema-and-structured-data-for-wp',
      issueType: 'schema-markup',
      estimatedTime: '5-10 minutes',
      steps: [
        'Go to Schema → Settings in admin',
        'Under "Select Schema Type" choose your content type',
        'For blogs: Select "Article" or "BlogPosting"',
        'For products: Select "Product"',
        'Enable "Automatically Create Schema"',
        'Fill in "Organization" details (name, logo, etc.)',
        'Click "Save Settings"',
        'For custom schema per post:',
        '  - Edit post → Find "Schema & Structured Data" meta box',
        '  - Choose schema type',
        '  - Fill in schema fields',
        'Validate: Tools → Structured Data Testing Tool'
      ]
    }
  },

  // Internal linking plugins
  'internal-links': {
    'internal-linking': {
      pluginSlug: 'internal-links',
      issueType: 'internal-linking',
      estimatedTime: '10 minutes setup',
      steps: [
        'Go to Settings → Internal Link Juicer in admin',
        'Set "Number of Links" to 3-5 per post',
        'Choose "Link from newest posts" or "Link from all posts"',
        'Add keywords under "Keywords" tab',
        '  - Add target keywords with their destination URLs',
        '  - Example: Keyword "SEO tips" → /seo-tips-guide',
        'Use "Blacklist" to exclude words you don\'t want linked',
        'Enable "Add links to new posts automatically"',
        'Click "Save Changes"',
        'Existing posts: Resave or use bulk editor to trigger linking'
      ]
    }
  }
};

/**
 * Get configuration steps for a specific plugin and issue type
 */
export function getPluginConfigSteps(pluginSlug: string, issueType: string): PluginConfigurationSteps | undefined {
  return WORDPRESS_PLUGIN_STEPS[pluginSlug]?.[issueType];
}

/**
 * Get all supported issue types for a plugin
 */
export function getPluginSupportedIssues(pluginSlug: string): string[] {
  return Object.keys(WORDPRESS_PLUGIN_STEPS[pluginSlug] || {});
}

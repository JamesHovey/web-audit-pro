import { NextRequest, NextResponse } from 'next/server';

interface WordPressPluginInfo {
  name: string;
  slug: string;
  version: string;
  author: string;
  rating: number;
  num_ratings: number;
  downloaded: number;
  active_installs: number;
  short_description: string;
  description: string;
  homepage: string;
  download_link: string;
}

interface PluginMetadata {
  name: string;
  slug: string;
  description: string;
  rating: number;
  reviews: number;
  activeInstalls: string;
  url: string;
  found: boolean;
}

/**
 * Premium plugins with their actual website URLs
 * These plugins are not on WordPress.org or have been delisted
 */
const PREMIUM_PLUGINS: Record<string, { url: string; description: string }> = {
  'SEOPress': {
    url: 'https://www.seopress.org/',
    description: 'SEOPress is a powerful WordPress SEO plugin to optimize your SEO, boost your traffic, improve social sharing, build custom HTML and XML Sitemaps, create optimized breadcrumbs, add schemas / Google Structured data types, manage redirections 301 and so much more.'
  },
  'WP Rocket': {
    url: 'https://wp-rocket.me/',
    description: 'WP Rocket is the most powerful caching plugin in the world. It provides immediate performance improvements with no complex configuration needed.'
  },
  'Gravity Forms': {
    url: 'https://www.gravityforms.com/',
    description: 'Gravity Forms is the easiest tool to create advanced forms for your WordPress site. Create contact forms, surveys, order forms, and more with drag & drop simplicity.'
  },
  'Advanced Custom Fields PRO': {
    url: 'https://www.advancedcustomfields.com/',
    description: 'Advanced Custom Fields PRO is the complete solution for fully customizing your edit screens with powerful fields and flexible content layouts.'
  },
  'ACF PRO': {
    url: 'https://www.advancedcustomfields.com/',
    description: 'Advanced Custom Fields PRO is the complete solution for fully customizing your edit screens with powerful fields and flexible content layouts.'
  },
  'WPBakery Page Builder': {
    url: 'https://wpbakery.com/',
    description: 'WPBakery Page Builder is a drag and drop frontend and backend page builder plugin that helps you build beautiful layouts quickly.'
  },
  'Slider Revolution': {
    url: 'https://www.sliderrevolution.com/',
    description: 'Slider Revolution is a premium slider plugin that helps you create stunning slideshows, hero blocks, and full page presentations.'
  },
  'LayerSlider': {
    url: 'https://layerslider.com/',
    description: 'LayerSlider is a premium multi-purpose animation platform with professional features for designers and developers.'
  },
  'WPML': {
    url: 'https://wpml.org/',
    description: 'WPML makes it easy to build multilingual sites and run them. It is powerful enough for corporate sites, yet simple for blogs.'
  }
};

/**
 * Convert plugin name to WordPress.org slug
 */
function getPluginSlug(pluginName: string): string {
  // Special case mappings for plugins with different slugs
  const specialCases: Record<string, string> = {
    'Yoast SEO': 'wordpress-seo',
    'RankMath SEO': 'seo-by-rank-math',
    'Rank Math': 'seo-by-rank-math',
    'All in One SEO': 'all-in-one-seo-pack',
    'Contact Form 7': 'contact-form-7',
    'WPForms': 'wpforms-lite',
    'Wordfence Security': 'wordfence',
    'W3 Total Cache': 'w3-total-cache',
    'WP Super Cache': 'wp-super-cache',
    'Elementor': 'elementor',
    'WooCommerce': 'woocommerce',
    'Advanced Custom Fields': 'advanced-custom-fields',
    'MonsterInsights': 'google-analytics-for-wordpress',
    'Really Simple SSL': 'really-simple-ssl',
    'UpdraftPlus': 'updraftplus',
    'Akismet': 'akismet',
    'Jetpack': 'jetpack',
    'Polylang': 'polylang',
    'Mailchimp for WordPress': 'mailchimp-for-wp',
    'LiteSpeed Cache': 'litespeed-cache',
    'WP Fastest Cache': 'wp-fastest-cache',
    'Autoptimize': 'autoptimize',
    'Smush': 'wp-smushit',
    'WP-Optimize': 'wp-optimize',
    'WP Optimize': 'wp-optimize',
    'Ninja Forms': 'ninja-forms',
    'Sucuri Security': 'sucuri-scanner',
    'iThemes Security': 'better-wp-security',
    'Duplicator': 'duplicator',
    'WP Mail SMTP': 'wp-mail-smtp',
    'Redirection': 'redirection',
    'Broken Link Checker': 'broken-link-checker',
    'Divi Builder': 'divi-builder',
    'Beaver Builder': 'beaver-builder-lite-version',
    'Social Warfare': 'social-warfare',
    'AddThis': 'addthis',
    'Custom Post Type UI': 'custom-post-type-ui',
    'All In One WP Security': 'all-in-one-wp-security-and-firewall',
    'Easy Digital Downloads': 'easy-digital-downloads',
    'Google Analytics Dashboard': 'google-analytics-dashboard-for-wp'
  };

  // Check special cases first
  const specialCase = Object.keys(specialCases).find(key =>
    pluginName.toLowerCase().includes(key.toLowerCase())
  );
  if (specialCase) {
    return specialCases[specialCase];
  }

  // Convert to slug format
  return pluginName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^wp-/, '')
    .replace(/-plugin$/, '')
    .replace(/-wordpress$/, '');
}

/**
 * Format active installs number
 */
function formatActiveInstalls(count: number): string {
  if (count >= 5000000) {
    return '5+ million';
  } else if (count >= 1000000) {
    return `${Math.floor(count / 1000000)}+ million`;
  } else if (count >= 100000) {
    return `${Math.floor(count / 100000)}00k+`;
  } else if (count >= 10000) {
    return `${Math.floor(count / 1000)}k+`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}k+`;
  }
  return `${count}+`;
}

/**
 * Scrape plugin page as fallback when API fails
 */
async function scrapePluginPage(slug: string): Promise<Partial<PluginMetadata>> {
  try {
    const pageUrl = `https://wordpress.org/plugins/${slug}/`;
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Page returned ${response.status}`);
    }

    const html = await response.text();

    // Extract description from meta tag or page content
    let description = 'No description available';
    const metaDescMatch = html.match(/<meta name="description" content="([^"]+)"/i);
    if (metaDescMatch) {
      description = metaDescMatch[1];
    } else {
      // Try to find description in the page content
      const descMatch = html.match(/<p class="plugin-description">([^<]+)<\/p>/i) ||
                       html.match(/<div class="entry-excerpt">([^<]+)<\/div>/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    }

    // Extract rating
    let rating = 0;
    const ratingMatch = html.match(/<div class="wporg-ratings"[^>]*>[\s\S]*?<span class="[^"]*">(\d+\.?\d*)<\/span>/i) ||
                       html.match(/rating-(\d+)/i);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1]);
      if (rating > 5) rating = rating / 20; // Convert from 0-100 to 0-5
    }

    // Extract review count
    let reviews = 0;
    const reviewMatch = html.match(/(\d+(?:,\d+)*)\s+reviews?/i) ||
                       html.match(/<span class="reviews-count">(\d+(?:,\d+)*)<\/span>/i);
    if (reviewMatch) {
      reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
    }

    // Extract active installs
    let activeInstalls = 'N/A';
    const installsMatch = html.match(/Active installations:\s*<\/strong>\s*([^<]+)/i) ||
                         html.match(/(\d+(?:,\d+)*\+?)\s+active installations/i);
    if (installsMatch) {
      activeInstalls = installsMatch[1].trim();
    }

    return {
      description,
      rating,
      reviews,
      activeInstalls,
      found: true
    };
  } catch (error) {
    console.log(`Failed to scrape plugin page for ${slug}:`, error);
    return {};
  }
}

/**
 * Fetch plugin metadata from WordPress.org API
 */
async function getWordPressPluginMetadata(pluginName: string): Promise<PluginMetadata> {
  // Check if this is a known premium plugin first
  const premiumPlugin = Object.keys(PREMIUM_PLUGINS).find(key =>
    pluginName.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(pluginName.toLowerCase())
  );

  if (premiumPlugin) {
    const premium = PREMIUM_PLUGINS[premiumPlugin];
    console.log(`✅ Detected premium plugin: ${pluginName}`);
    return {
      name: pluginName,
      slug: getPluginSlug(pluginName),
      description: premium.description,
      rating: 0, // Premium plugins don't have WordPress.org ratings
      reviews: 0,
      activeInstalls: 'Premium Plugin',
      url: premium.url,
      found: true
    };
  }

  const slug = getPluginSlug(pluginName);

  try {
    console.log(`Fetching metadata for plugin: ${pluginName} (slug: ${slug})`);

    // Use the correct WordPress.org API v1.2 format with query parameters
    const apiUrl = `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${encodeURIComponent(slug)}&request[fields][short_description]=true&request[fields][rating]=true&request[fields][num_ratings]=true&request[fields][active_installs]=true`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Web-Audit-Pro/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: WordPressPluginInfo = await response.json();

    const metadata: PluginMetadata = {
      name: data.name || pluginName,
      slug: data.slug,
      description: data.short_description || data.description?.substring(0, 200) || 'No description available',
      rating: Math.round(data.rating / 20 * 10) / 10, // Convert from 0-100 to 0-5
      reviews: data.num_ratings || 0,
      activeInstalls: formatActiveInstalls(data.active_installs || 0),
      url: `https://wordpress.org/plugins/${slug}/`,
      found: true
    };

    console.log(`✅ Successfully fetched metadata for ${pluginName}`);
    return metadata;
  } catch (error) {
    console.log(`⚠️  API failed for ${pluginName}, trying web scraping fallback...`);

    // Try scraping the plugin page as fallback
    const scraped = await scrapePluginPage(slug);

    if (scraped.description && scraped.description !== 'No description available') {
      const metadata: PluginMetadata = {
        name: pluginName,
        slug,
        description: scraped.description,
        rating: scraped.rating || 0,
        reviews: scraped.reviews || 0,
        activeInstalls: scraped.activeInstalls || 'N/A',
        url: `https://wordpress.org/plugins/${slug}/`,
        found: scraped.found || false
      };
      console.log(`✅ Successfully scraped metadata for ${pluginName}`);
      return metadata;
    }

    // Return fallback data if both API and scraping failed
    const fallback: PluginMetadata = {
      name: pluginName,
      slug,
      description: 'Premium or custom plugin - detailed information not available from WordPress.org',
      rating: 0,
      reviews: 0,
      activeInstalls: 'N/A',
      url: `https://wordpress.org/plugins/${slug}/`,
      found: false
    };

    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plugins } = body;

    if (!plugins || !Array.isArray(plugins)) {
      return NextResponse.json(
        { error: 'Invalid request: plugins array required' },
        { status: 400 }
      );
    }

    console.log(`📦 Fetching metadata for ${plugins.length} plugins...`);

    // Fetch metadata for all plugins in batches to avoid overwhelming the API
    const BATCH_SIZE = 5;
    const results: Record<string, PluginMetadata> = {};

    for (let i = 0; i < plugins.length; i += BATCH_SIZE) {
      const batch = plugins.slice(i, i + BATCH_SIZE);
      const promises = batch.map((pluginName: string) => getWordPressPluginMetadata(pluginName));
      const batchResults = await Promise.all(promises);

      batchResults.forEach((metadata, index) => {
        results[batch[index]] = metadata;
      });

      // Small delay between batches to be respectful to the API
      if (i + BATCH_SIZE < plugins.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Fetched metadata for ${Object.keys(results).length} plugins`);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching plugin metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plugin metadata' },
      { status: 500 }
    );
  }
}

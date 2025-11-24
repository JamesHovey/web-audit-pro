/**
 * WordPress Plugin Metadata Service
 * Fetches plugin information from WordPress.org API
 */

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

// Cache plugin metadata to avoid repeated API calls
const pluginCache = new Map<string, PluginMetadata>();

/**
 * Convert plugin name to WordPress.org slug
 */
function getPluginSlug(pluginName: string): string {
  // Special case mappings for plugins with different slugs
  const specialCases: Record<string, string> = {
    'Yoast SEO': 'wordpress-seo',
    'RankMath SEO': 'seo-by-rank-math',
    'All in One SEO': 'all-in-one-seo-pack',
    'Contact Form 7': 'contact-form-7',
    'WPForms': 'wpforms-lite',
    'Wordfence Security': 'wordfence',
    'W3 Total Cache': 'w3-total-cache',
    'WP Super Cache': 'wp-super-cache',
    'Elementor': 'elementor',
    'WooCommerce': 'woocommerce',
    'Gravity Forms': 'gravityforms', // Premium plugin, might not be in repo
    'Advanced Custom Fields': 'advanced-custom-fields',
    'MonsterInsights': 'google-analytics-for-wordpress',
    'Really Simple SSL': 'really-simple-ssl',
    'UpdraftPlus': 'updraftplus',
    'Akismet': 'akismet',
    'Jetpack': 'jetpack',
    'WPML': 'sitepress-multilingual-cms', // Premium, might not be in repo
    'Polylang': 'polylang',
    'WP Rocket': 'wp-rocket', // Premium, not in repo
    'Mailchimp for WordPress': 'mailchimp-for-wp',
    'LiteSpeed Cache': 'litespeed-cache',
    'WP Fastest Cache': 'wp-fastest-cache',
    'Autoptimize': 'autoptimize',
    'Smush': 'wp-smushit',
    'WP-Optimize': 'wp-optimize',
    'Ninja Forms': 'ninja-forms',
    'Sucuri Security': 'sucuri-scanner',
    'iThemes Security': 'better-wp-security',
    'Duplicator': 'duplicator',
    'WP Mail SMTP': 'wp-mail-smtp',
    'Redirection': 'redirection',
    'Broken Link Checker': 'broken-link-checker'
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
 * Fetch plugin metadata from WordPress.org API
 */
export async function getWordPressPluginMetadata(pluginName: string): Promise<PluginMetadata> {
  const slug = getPluginSlug(pluginName);

  // Check cache first
  if (pluginCache.has(slug)) {
    return pluginCache.get(slug)!;
  }

  try {
    const response = await fetch(`https://api.wordpress.org/plugins/info/1.0/${slug}.json`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: WordPressPluginInfo = await response.json();

    const metadata: PluginMetadata = {
      name: data.name || pluginName,
      slug: data.slug,
      description: data.short_description || 'No description available',
      rating: Math.round(data.rating / 20) / 10, // Convert from 0-100 to 0-5
      reviews: data.num_ratings || 0,
      activeInstalls: formatActiveInstalls(data.active_installs || 0),
      url: `https://wordpress.org/plugins/${slug}/`,
      found: true
    };

    // Cache the result
    pluginCache.set(slug, metadata);

    return metadata;
  } catch (error) {
    console.log(`Could not fetch metadata for plugin: ${pluginName} (${slug})`);

    // Return fallback data
    const fallback: PluginMetadata = {
      name: pluginName,
      slug,
      description: 'Premium or custom plugin - metadata not available',
      rating: 0,
      reviews: 0,
      activeInstalls: 'N/A',
      url: `https://wordpress.org/plugins/${slug}/`,
      found: false
    };

    // Cache the fallback to avoid repeated failed requests
    pluginCache.set(slug, fallback);

    return fallback;
  }
}

/**
 * Batch fetch metadata for multiple plugins
 */
export async function batchGetPluginMetadata(pluginNames: string[]): Promise<Map<string, PluginMetadata>> {
  const results = new Map<string, PluginMetadata>();

  // Fetch in batches to avoid overwhelming the API
  const BATCH_SIZE = 5;
  for (let i = 0; i < pluginNames.length; i += BATCH_SIZE) {
    const batch = pluginNames.slice(i, i + BATCH_SIZE);
    const promises = batch.map(name => getWordPressPluginMetadata(name));
    const batchResults = await Promise.all(promises);

    batchResults.forEach((metadata, index) => {
      results.set(batch[index], metadata);
    });

    // Small delay between batches
    if (i + BATCH_SIZE < pluginNames.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearPluginMetadataCache(): void {
  pluginCache.clear();
}

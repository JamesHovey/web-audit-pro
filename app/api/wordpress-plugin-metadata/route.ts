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
    'Gravity Forms': 'gravityforms',
    'Advanced Custom Fields': 'advanced-custom-fields',
    'MonsterInsights': 'google-analytics-for-wordpress',
    'Really Simple SSL': 'really-simple-ssl',
    'UpdraftPlus': 'updraftplus',
    'Akismet': 'akismet',
    'Jetpack': 'jetpack',
    'WPML': 'sitepress-multilingual-cms',
    'Polylang': 'polylang',
    'WP Rocket': 'wp-rocket',
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
    'WPBakery Page Builder': 'js_composer',
    'Beaver Builder': 'beaver-builder',
    'Social Warfare': 'social-warfare',
    'AddThis': 'addthis',
    'Custom Post Type UI': 'custom-post-type-ui',
    'All In One WP Security': 'all-in-one-wp-security-and-firewall',
    'Easy Digital Downloads': 'easy-digital-downloads',
    'Google Analytics Dashboard': 'google-analytics-dashboard-for-wp',
    'BackupBuddy': 'backupbuddy'
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
async function getWordPressPluginMetadata(pluginName: string): Promise<PluginMetadata> {
  const slug = getPluginSlug(pluginName);

  try {
    console.log(`Fetching metadata for plugin: ${pluginName} (slug: ${slug})`);

    const response = await fetch(`https://api.wordpress.org/plugins/info/1.0/${slug}.json`, {
      headers: {
        'User-Agent': 'Web-Audit-Pro/1.0'
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
    console.log(`⚠️  Could not fetch metadata for plugin: ${pluginName} (${slug})`);

    // Return fallback data
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

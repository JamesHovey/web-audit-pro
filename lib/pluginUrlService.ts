/**
 * Plugin URL Service
 * Maps plugin names to their official websites
 */

interface PluginUrl {
  name: string;
  url: string;
  category: string;
}

const PLUGIN_URLS: PluginUrl[] = [
  // SEO Plugins
  { name: 'Yoast SEO', url: 'https://yoast.com/wordpress/plugins/seo/', category: 'seo' },
  { name: 'RankMath SEO', url: 'https://rankmath.com/', category: 'seo' },
  { name: 'All in One SEO', url: 'https://aioseo.com/', category: 'seo' },
  
  // E-commerce
  { name: 'WooCommerce', url: 'https://woocommerce.com/', category: 'ecommerce' },
  
  // Security
  { name: 'Wordfence Security', url: 'https://www.wordfence.com/', category: 'security' },
  { name: 'Sucuri Security', url: 'https://sucuri.net/', category: 'security' },
  
  // Performance & Caching
  { name: 'WP Rocket', url: 'https://wp-rocket.me/', category: 'performance' },
  { name: 'Autoptimize', url: 'https://autoptimize.com/', category: 'performance' },
  { name: 'W3 Total Cache', url: 'https://www.boldgrid.com/w3-total-cache/', category: 'performance' },
  { name: 'LiteSpeed Cache', url: 'https://www.litespeedtech.com/products/cache-plugins/wordpress-acceleration', category: 'performance' },
  { name: 'WP Super Cache', url: 'https://wordpress.org/plugins/wp-super-cache/', category: 'performance' },
  { name: 'WP Fastest Cache', url: 'https://wordpress.org/plugins/wp-fastest-cache/', category: 'performance' },
  
  // Forms
  { name: 'Contact Form 7', url: 'https://contactform7.com/', category: 'forms' },
  { name: 'Gravity Forms', url: 'https://www.gravityforms.com/', category: 'forms' },
  { name: 'WPForms', url: 'https://wpforms.com/', category: 'forms' },
  
  // Backup
  { name: 'UpdraftPlus', url: 'https://updraftplus.com/', category: 'backup' },
  
  // Page Builders
  { name: 'Elementor', url: 'https://elementor.com/', category: 'pagebuilder' },
  { name: 'Divi', url: 'https://www.elegantthemes.com/gallery/divi/', category: 'pagebuilder' },
  { name: 'Beaver Builder', url: 'https://www.wpbeaverbuilder.com/', category: 'pagebuilder' },
  { name: 'WPBakery Page Builder', url: 'https://wpbakery.com/', category: 'pagebuilder' },
  { name: 'Fusion Builder (Avada)', url: 'https://avada.theme-fusion.com/', category: 'pagebuilder' },
  
  // Popular WordPress plugins
  { name: 'Jetpack', url: 'https://jetpack.com/', category: 'utility' },
  { name: 'Akismet', url: 'https://akismet.com/', category: 'security' },
  { name: 'MonsterInsights', url: 'https://www.monsterinsights.com/', category: 'analytics' },
  { name: 'Mailchimp for WordPress', url: 'https://www.mc4wp.com/', category: 'marketing' },
  { name: 'Slider Revolution', url: 'https://www.sliderrevolution.com/', category: 'design' },
  { name: 'Advanced Custom Fields', url: 'https://www.advancedcustomfields.com/', category: 'development' },
  { name: 'WPML', url: 'https://wpml.org/', category: 'translation' },
  { name: 'Polylang', url: 'https://polylang.pro/', category: 'translation' }
];

export function getPluginUrl(pluginName: string): string | null {
  const plugin = PLUGIN_URLS.find(p => 
    p.name.toLowerCase() === pluginName.toLowerCase() ||
    pluginName.toLowerCase().includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(pluginName.toLowerCase())
  );
  
  return plugin ? plugin.url : null;
}

export function isKnownPlugin(pluginName: string): boolean {
  return getPluginUrl(pluginName) !== null;
}

export function getPluginCategory(pluginName: string): string | null {
  const plugin = PLUGIN_URLS.find(p => 
    p.name.toLowerCase() === pluginName.toLowerCase() ||
    pluginName.toLowerCase().includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(pluginName.toLowerCase())
  );
  
  return plugin ? plugin.category : null;
}

export function formatPluginName(pluginName: string): string {
  // Clean up common plugin name variations
  return pluginName
    .replace(/\s*plugin\s*/gi, '')
    .replace(/\s*wordpress\s*/gi, '')
    .replace(/\s*wp\s*/gi, '')
    .trim();
}

export function getPluginInfo(pluginName: string): {
  name: string;
  url: string | null;
  category: string | null;
  isKnown: boolean;
} {
  const cleanName = formatPluginName(pluginName);
  const url = getPluginUrl(cleanName);
  const category = getPluginCategory(cleanName);
  
  return {
    name: cleanName,
    url,
    category,
    isKnown: url !== null
  };
}
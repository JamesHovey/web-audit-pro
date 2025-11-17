/**
 * DNS-Based Hosting Detection
 * Similar to whoishostingthis.com - uses DNS/IP analysis to identify actual hosting provider
 *
 * 3-Layer Detection:
 * 1. DNS Nameserver Pattern Matching (FREE, instant)
 * 2. IP-to-ASN Lookup via IPinfo.io (50K free/month, then $0.001 each)
 * 3. Fallback to "Bespoke" for unknown
 */

import { resolveNs as dnsResolveNs, resolve4 as dnsResolve4 } from 'dns';
import { promisify } from 'util';

const resolveNs = promisify(dnsResolveNs);
const resolve4 = promisify(dnsResolve4);

interface HostingDetectionResult {
  provider: string;
  method: 'nameserver' | 'ip-asn' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  details?: string;
}

/**
 * Comprehensive nameserver patterns for major hosting providers
 */
const NAMESERVER_PATTERNS = [
  // Cloud Providers
  { pattern: /\.awsdns.*\.com|\.awsdns.*\.org|\.awsdns.*\.net/i, provider: 'AWS' },
  { pattern: /\.googledomains\.com|\.google\.com|ns-cloud-.*\.googledomains\.com/i, provider: 'Google Cloud' },
  { pattern: /\.azure-dns\.|\.azure\.com|\.windows\.net.*dns/i, provider: 'Microsoft Azure' },
  { pattern: /\.cloudflare\.com|\.cloudflare\.net/i, provider: 'Cloudflare' },
  { pattern: /\.digitalocean\.com|\.do\.com/i, provider: 'DigitalOcean' },
  { pattern: /\.linode\.com/i, provider: 'Linode' },
  { pattern: /\.vultr\.com/i, provider: 'Vultr' },

  // Hosting Companies
  { pattern: /\.hostgator\.com|hostgator/i, provider: 'HostGator' },
  { pattern: /\.bluehost\.com|bluehost/i, provider: 'Bluehost' },
  { pattern: /\.siteground\.|siteground/i, provider: 'SiteGround' },
  { pattern: /\.godaddy\.com|\.secureserver\.net|domaincontrol/i, provider: 'GoDaddy' },
  { pattern: /\.hostinger\.|hostinger/i, provider: 'Hostinger' },
  { pattern: /\.dreamhost\.com|dreamhost/i, provider: 'DreamHost' },
  { pattern: /\.inmotionhosting\.com|inmotion/i, provider: 'InMotion Hosting' },
  { pattern: /\.a2hosting\.com|a2hosting/i, provider: 'A2 Hosting' },
  { pattern: /\.wpengine\.com|wpengine/i, provider: 'WP Engine' },
  { pattern: /\.kinsta\.com|kinsta/i, provider: 'Kinsta' },
  { pattern: /\.flywheel\.com|getflywheel/i, provider: 'Flywheel' },
  { pattern: /\.pagely\.com|pagely/i, provider: 'Pagely' },

  // Platform-specific
  { pattern: /\.shopify\.com/i, provider: 'Shopify' },
  { pattern: /\.squarespace\.com/i, provider: 'Squarespace' },
  { pattern: /\.wix\.com|wixdns/i, provider: 'Wix' },
  { pattern: /\.webflow\.io|webflow/i, provider: 'Webflow' },
  { pattern: /\.vercel-dns\.com|\.vercel\.com/i, provider: 'Vercel' },
  { pattern: /\.netlify\.com|netlify/i, provider: 'Netlify' },
  { pattern: /\.herokuapp\.com|heroku/i, provider: 'Heroku' },
  { pattern: /\.github\.io|github/i, provider: 'GitHub Pages' },

  // Registrars (often used as DNS)
  { pattern: /\.namecheap\.com|registrar-servers/i, provider: 'Namecheap' },
  { pattern: /\.1and1\.com|1and1/i, provider: '1&1 IONOS' },
  { pattern: /\.ovh\.net|ovh\.com/i, provider: 'OVH' },

  // CDN/DNS Services (may indicate hosting)
  { pattern: /\.cloudfront\.net/i, provider: 'AWS CloudFront' },
  { pattern: /\.fastly\.net/i, provider: 'Fastly' },

  // UK-specific providers
  { pattern: /\.123-reg\.co\.uk|123-reg/i, provider: '123 Reg' },
  { pattern: /\.ukfast\.co\.uk|ukfast/i, provider: 'UKFast' },
  { pattern: /\.fasthosts\.co\.uk|fasthosts/i, provider: 'Fasthosts' },
  { pattern: /\.heart\.co\.uk|heartinternet/i, provider: 'Heart Internet' },
  { pattern: /\.tsohost\.com|tsohost/i, provider: 'TSOHost' },
];

/**
 * IP-to-ASN patterns (when we get the ASN/organization from IPinfo.io)
 * This helps map ASN org names to friendly provider names
 */
const ASN_PATTERNS = [
  // Cloud Providers
  { pattern: /amazon|aws|amazon technologies/i, provider: 'AWS' },
  { pattern: /google|google cloud|google llc/i, provider: 'Google Cloud' },
  { pattern: /microsoft|azure|microsoft corporation/i, provider: 'Microsoft Azure' },
  { pattern: /cloudflare/i, provider: 'Cloudflare' },
  { pattern: /digitalocean/i, provider: 'DigitalOcean' },
  { pattern: /linode/i, provider: 'Linode' },
  { pattern: /vultr/i, provider: 'Vultr' },
  { pattern: /hetzner/i, provider: 'Hetzner' },
  { pattern: /ovh/i, provider: 'OVH' },

  // Hosting Companies
  { pattern: /hostgator/i, provider: 'HostGator' },
  { pattern: /bluehost|blue host/i, provider: 'Bluehost' },
  { pattern: /siteground/i, provider: 'SiteGround' },
  { pattern: /godaddy/i, provider: 'GoDaddy' },
  { pattern: /hostinger/i, provider: 'Hostinger' },
  { pattern: /dreamhost/i, provider: 'DreamHost' },
  { pattern: /wpengine|wp engine/i, provider: 'WP Engine' },
  { pattern: /kinsta/i, provider: 'Kinsta' },

  // UK providers
  { pattern: /ukfast/i, provider: 'UKFast' },
  { pattern: /fasthosts/i, provider: 'Fasthosts' },
  { pattern: /123.?reg/i, provider: '123 Reg' },
];

/**
 * Layer 1: Detect hosting from DNS nameservers (FREE, instant)
 */
async function detectFromNameservers(domain: string): Promise<HostingDetectionResult | null> {
  try {
    console.log(`🔍 DNS Layer 1: Checking nameservers for ${domain}...`);

    const nameservers = await resolveNs(domain);
    console.log(`   Found nameservers:`, nameservers.join(', '));

    // Check each nameserver against patterns
    for (const ns of nameservers) {
      for (const { pattern, provider } of NAMESERVER_PATTERNS) {
        if (pattern.test(ns)) {
          console.log(`   ✅ Matched nameserver pattern: ${ns} → ${provider}`);
          return {
            provider,
            method: 'nameserver',
            confidence: 'high',
            details: `Nameserver: ${ns}`
          };
        }
      }
    }

    console.log(`   ⚠️ No nameserver patterns matched`);
    return null;

  } catch (error) {
    console.error(`   ❌ Nameserver lookup failed:`, error);
    return null;
  }
}

/**
 * Layer 2: Detect hosting from IP address via IPinfo.io API (50K free/month)
 */
async function detectFromIPAddress(domain: string): Promise<HostingDetectionResult | null> {
  try {
    console.log(`🔍 DNS Layer 2: Resolving IP address for ${domain}...`);

    // Get IP address
    const addresses = await resolve4(domain);
    if (!addresses || addresses.length === 0) {
      console.log(`   ⚠️ No IP addresses found`);
      return null;
    }

    const ip = addresses[0];
    console.log(`   Found IP: ${ip}`);

    // Check if IPinfo.io API key is available
    const apiKey = process.env.IPINFO_API_KEY;
    if (!apiKey) {
      console.log(`   ⚠️ IPinfo.io API key not configured (IPINFO_API_KEY env var)`);
      console.log(`   💡 Sign up at https://ipinfo.io for 50K free requests/month`);
      return null;
    }

    // Query IPinfo.io API
    console.log(`   🌐 Querying IPinfo.io for IP ${ip}...`);
    const response = await fetch(`https://ipinfo.io/${ip}?token=${apiKey}`);

    if (!response.ok) {
      console.log(`   ❌ IPinfo.io API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`   API Response:`, JSON.stringify(data, null, 2));

    // Extract organization/ASN info
    const org = data.org || '';
    const company = data.company?.name || '';
    const hostname = data.hostname || '';

    // Try to match against ASN patterns
    const searchText = `${org} ${company} ${hostname}`.toLowerCase();

    for (const { pattern, provider } of ASN_PATTERNS) {
      if (pattern.test(searchText)) {
        console.log(`   ✅ Matched ASN pattern: ${org} → ${provider}`);
        return {
          provider,
          method: 'ip-asn',
          confidence: 'high',
          details: `IP: ${ip}, Org: ${org}`
        };
      }
    }

    // If we have org info but no pattern match, return the org name cleaned up
    if (org) {
      // Remove ASN number prefix (e.g., "AS12345 Company Name" → "Company Name")
      const cleanOrg = org.replace(/^AS\d+\s+/i, '').trim();

      // If it's a recognizable company name, return it
      if (cleanOrg.length > 3 && cleanOrg.length < 50) {
        console.log(`   📌 Using organization name: ${cleanOrg}`);
        return {
          provider: cleanOrg,
          method: 'ip-asn',
          confidence: 'medium',
          details: `IP: ${ip}, Org: ${org}`
        };
      }
    }

    console.log(`   ⚠️ No ASN patterns matched, org: ${org}`);
    return null;

  } catch (error) {
    console.error(`   ❌ IP address lookup failed:`, error);
    return null;
  }
}

/**
 * Main function: Detect hosting provider using hybrid DNS approach
 */
export async function detectHostingProvider(domain: string): Promise<HostingDetectionResult> {
  console.log(`\n🔎 Starting DNS-based hosting detection for ${domain}`);

  // Remove protocol and path if present
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];

  console.log(`   Cleaned domain: ${cleanDomain}`);

  // Layer 1: Try nameserver detection (FREE, fast)
  const nsResult = await detectFromNameservers(cleanDomain);
  if (nsResult) {
    console.log(`✅ Hosting detected via nameservers: ${nsResult.provider}\n`);
    return nsResult;
  }

  // Layer 2: Try IP-based detection (50K free/month)
  const ipResult = await detectFromIPAddress(cleanDomain);
  if (ipResult) {
    console.log(`✅ Hosting detected via IP/ASN: ${ipResult.provider}\n`);
    return ipResult;
  }

  // Layer 3: Unknown - return Bespoke
  console.log(`⚠️ Could not identify hosting provider - returning "Bespoke"\n`);
  return {
    provider: 'Bespoke',
    method: 'unknown',
    confidence: 'low',
    details: 'Could not identify hosting provider from DNS/IP analysis'
  };
}

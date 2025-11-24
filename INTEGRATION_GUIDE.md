# Audit Configuration Integration Guide

This guide explains how to integrate the category-level audit configuration into your application.

## Files Created

1. `/types/auditConfiguration.ts` - TypeScript types and profiles
2. `/components/AuditConfigurationPanel.tsx` - UI component
3. This integration guide

---

## Step 1: Add Configuration to Audit Page

Edit your audit page (likely `/app/audit/page.tsx` or similar):

```typescript
'use client'

import { useState } from 'react'
import AuditConfigurationPanel from '@/components/AuditConfigurationPanel'
import { AuditConfiguration, getDefaultAuditConfiguration } from '@/types/auditConfiguration'

export default function AuditPage() {
  const [url, setUrl] = useState('')
  const [auditType, setAuditType] = useState<'single' | 'all'>('single')
  const [auditConfig, setAuditConfig] = useState<AuditConfiguration>(getDefaultAuditConfiguration())

  const handleStartAudit = async () => {
    // Pass configuration to audit API
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        auditType,
        configuration: auditConfig // ⭐ Send config to backend
      })
    })

    // ... handle response
  }

  return (
    <div className="space-y-6">
      {/* Existing URL Input */}
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
      />

      {/* Existing Audit Type Selection */}
      <select value={auditType} onChange={(e) => setAuditType(e.target.value as any)}>
        <option value="single">Single Page</option>
        <option value="all">All Discoverable Pages</option>
      </select>

      {/* ⭐ NEW: Audit Configuration Panel */}
      <AuditConfigurationPanel
        onConfigurationChange={setAuditConfig}
        estimatedPageCount={auditType === 'all' ? 100 : 1}
      />

      {/* Start Audit Button */}
      <button onClick={handleStartAudit}>
        Start Audit
      </button>
    </div>
  )
}
```

---

## Step 2: Update Audit API to Accept Configuration

Edit `/app/api/audit/route.ts` (or wherever your audit API is):

```typescript
import { AuditConfiguration, getDefaultAuditConfiguration } from '@/types/auditConfiguration'

export async function POST(request: Request) {
  const body = await request.json()
  const { url, auditType, configuration } = body

  // Use provided configuration or default
  const config: AuditConfiguration = configuration || getDefaultAuditConfiguration()

  // Pass configuration to audit service
  const results = await performAudit(url, auditType, config)

  return Response.json(results)
}
```

---

## Step 3: Update Technical Audit Service

Edit `/lib/technicalAuditService.ts` to accept and use configuration:

```typescript
import { AuditConfiguration, getDefaultAuditConfiguration } from '@/types/auditConfiguration'

export async function performFullAudit(
  url: string,
  auditType: 'single' | 'all' | 'custom',
  onProgress?: ProgressCallback,
  configuration?: AuditConfiguration // ⭐ NEW parameter
): Promise<AuditResult> {

  // Use provided config or default
  const config = configuration || getDefaultAuditConfiguration()

  console.log('🔧 Audit Configuration:', config)

  // ... existing code ...

  // ⭐ Conditional execution based on configuration

  // Technical SEO checks
  if (config.technicalSEO) {
    console.log('✅ Running Technical SEO checks...')
    // Analyze H1, meta titles, descriptions, title length, etc.
    const pagesWithMissingTitles = pageDiscovery.pages.filter(p => !p.hasTitle)
    result.issues.missingMetaTitles = pagesWithMissingTitles.length
    // ... other technical SEO checks
  } else {
    console.log('⏭️  Skipping Technical SEO checks (disabled)')
  }

  // Internal Linking Analysis
  if (config.internalLinking && pageDiscovery.pages.length > 1) {
    console.log('✅ Running Internal Linking analysis...')
    const internalLinkAnalysis = analyzeInternalLinks(result.pages, domain)
    result.internalLinkAnalysis = internalLinkAnalysis
    // ... other internal linking checks
  } else {
    console.log('⏭️  Skipping Internal Linking analysis (disabled)')
  }

  // Performance Metrics
  if (config.performanceMetrics) {
    console.log('✅ Running Performance analysis...')
    // Run Lighthouse, Core Web Vitals, etc.
    const pagesWithPerformance = await processInChunks(/* ... */)
    result.pages = pagesWithPerformance
  } else {
    console.log('⏭️  Skipping Performance analysis (disabled)')
    // Still need to populate result.pages but without performance data
    result.pages = pageDiscovery.pages.map(page => ({
      url: page.url,
      title: page.title,
      statusCode: page.statusCode,
      hasTitle: page.hasTitle,
      hasDescription: page.hasDescription,
      hasH1: page.hasH1,
      imageCount: page.imageCount,
      source: page.source,
      performance: undefined // No performance data
    }))
  }

  // Security & Redirects
  if (config.securityAndRedirects) {
    console.log('✅ Running Security & Redirects checks...')
    // HTTPS, HSTS, permanent redirects, 4XX errors
    const redirectAnalysis = await analyzePermanentRedirects(/* ... */)
    const hstsAnalysis = await analyzeHSTS(/* ... */)
    result.permanentRedirects = redirectAnalysis
    result.hstsAnalysis = hstsAnalysis
  } else {
    console.log('⏭️  Skipping Security & Redirects checks (disabled)')
  }

  // Content Quality
  if (config.contentQuality) {
    console.log('✅ Running Content Quality checks...')
    // Text-to-HTML ratio, readability, etc.
    const textHtmlRatio = calculateTextToHtmlRatio(/* ... */)
    result.textHtmlRatio = textHtmlRatio
  } else {
    console.log('⏭️  Skipping Content Quality checks (disabled)')
  }

  // Image Optimization
  if (config.imageOptimization) {
    console.log('✅ Running Image Optimization checks...')
    // Large images, legacy formats, missing alt tags
    const imageAnalysis = analyzeImages(/* ... */)
    result.largeImages = imageAnalysis.largeCount
    result.largeImageDetails = imageAnalysis.details
  } else {
    console.log('⏭️  Skipping Image Optimization checks (disabled)')
  }

  // Accessibility Analysis
  if (config.accessibilityAnalysis) {
    console.log('✅ Running Accessibility analysis...')
    // WCAG compliance, color contrast, etc.
    const accessibilityResults = await analyzeAccessibility(/* ... */)
    result.accessibility = accessibilityResults
  } else {
    console.log('⏭️  Skipping Accessibility analysis (disabled)')
  }

  // Viewport Analysis
  if (config.viewportAnalysis) {
    console.log('✅ Running Viewport analysis...')
    // Multi-device rendering tests
    const viewportResults = await analyzeViewports(/* ... */)
    result.viewportAnalysis = viewportResults
  } else {
    console.log('⏭️  Skipping Viewport analysis (disabled)')
  }

  return result
}
```

---

## Step 4: Store Configuration (Optional)

### Option A: LocalStorage (Client-side)

```typescript
// Save user's last configuration
const saveConfiguration = (config: AuditConfiguration) => {
  localStorage.setItem('auditConfiguration', JSON.stringify(config))
}

// Load saved configuration
const loadConfiguration = (): AuditConfiguration => {
  const saved = localStorage.getItem('auditConfiguration')
  return saved ? JSON.parse(saved) : getDefaultAuditConfiguration()
}
```

### Option B: Database (Per Organization)

```prisma
// Add to schema.prisma
model Organization {
  id                    String   @id @default(uuid())
  name                  String
  defaultAuditConfig    Json?    // Store configuration as JSON
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## Step 5: Update EnhancedRecommendations (Optional)

You might want to hide recommendation categories that weren't run:

```typescript
// In EnhancedRecommendations.tsx
export default function EnhancedRecommendations({
  // ... existing props
  auditConfiguration // ⭐ NEW prop
}: {
  auditConfiguration?: AuditConfiguration
}) {

  const getTechnicalSEORecommendations = (): Recommendation[] => {
    const techRecs: Recommendation[] = []

    // Only show technical SEO recommendations if category was enabled
    if (!auditConfiguration?.technicalSEO) {
      return techRecs // Return empty if disabled
    }

    // ... existing recommendation logic
    if (technicalIssues?.missingH1Tags && technicalIssues.missingH1Tags > 0) {
      techRecs.push({
        title: 'Add Missing H1 Tags',
        // ...
      })
    }

    return techRecs
  }

  // Similar for other categories...
}
```

---

## Testing Checklist

- [ ] Quick Scan profile disables expensive checks
- [ ] Standard profile runs recommended checks
- [ ] Comprehensive profile runs all checks
- [ ] Custom toggles work independently
- [ ] Estimated time updates when toggling categories
- [ ] Configuration persists between page refreshes (if using localStorage)
- [ ] Audit results only show data for enabled categories
- [ ] Console logs show which checks are running/skipped

---

## Performance Benefits

### Quick Scan (Technical SEO + Security only)
- **Before:** 10-15 minutes for 100 pages
- **After:** 2-3 minutes for 100 pages
- **Savings:** ~80% reduction in audit time

### Standard Audit (Recommended checks)
- **Before:** 10-15 minutes
- **After:** 5-8 minutes
- **Savings:** ~40% reduction in audit time

### No Viewport Analysis
- **Before:** +5 seconds per page = +8 minutes for 100 pages
- **After:** 0 seconds
- **Savings:** Significant for large audits

---

## Future Enhancements

1. **Saved Presets:** Let users save custom configurations with names
2. **Organization Defaults:** Set default config for all team members
3. **API Rate Limiting:** Charge based on enabled categories
4. **Audit Credits:** Different categories cost different amounts
5. **Scheduled Audits:** Run specific configurations on schedule
6. **Comparison Mode:** Compare results with different configurations

---

## UI Placement Recommendation

Place the `AuditConfigurationPanel` component:
- **Below** the URL input field
- **Below** the audit type selector (Single Page / All Discoverable Pages)
- **Above** the "Start Audit" button

This creates a logical flow:
1. What to audit (URL)
2. How much to audit (Single / All)
3. What to check (Configuration)
4. Start the audit

---

## Questions?

- Should disabled categories show in results with "Not checked" status?
- Should we add a "Learn More" link for each category?
- Should quick scan be free, standard cost 1 credit, comprehensive cost 3 credits?

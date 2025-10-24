# Audit Performance Analysis & Optimization Recommendations

## Current Performance Bottlenecks

### 1. **Sequential Section Processing** ⏱️ MAJOR BOTTLENECK
**Issue:** Sections run one at a time (traffic → performance → keywords)
**Impact:** Total time = Sum of all sections (~2-5 minutes per audit)

```
Traffic section:     ~30-60 seconds
Performance section: ~45-90 seconds
Keywords section:    ~60-120 seconds
──────────────────────────────────
Total:              ~2.5-4.5 minutes
```

**Solution:** Run sections in parallel
```typescript
// BEFORE (Sequential)
for (const section of sections) {
  if (section === 'traffic') await processTraffic()
  if (section === 'performance') await processPerformance()
  if (section === 'keywords') await processKeywords()
}

// AFTER (Parallel)
const promises = sections.map(section => {
  if (section === 'traffic') return processTraffic()
  if (section === 'performance') return processPerformance()
  if (section === 'keywords') return processKeywords()
})
await Promise.all(promises)
```

**Expected Improvement:** 60-70% reduction (4 minutes → 1.5 minutes)

---

### 2. **Claude API Calls** ⏱️ MAJOR BOTTLENECK
**Issue:** Multiple sequential Claude API calls
**Impact:** 15-30 seconds per call

**Current Claude Calls:**
- Business detection: ~16 seconds
- Plugin analysis: 2 calls
- Performance analysis: 1 call
- Technical SEO analysis: 1 call
- Image optimization analysis: 1 call
- Technology analysis: 1 call

**Total:** 6-8 Claude API calls per audit

**Solutions:**

**A. Combine Related Analyses (Recommended)**
```typescript
// BEFORE: 3 separate calls
const performance = await analyzePerformanceWithClaude(html)
const techSEO = await analyzeTechnicalSEOWithClaude(html)
const images = await analyzeImageOptimizationWithClaude(html)

// AFTER: 1 combined call
const combined = await analyzeWebsiteWithClaude(html, {
  analyze: ['performance', 'techSEO', 'images']
})
```

**B. Use Batch API (When Available)**
Claude's Batch API is 50% cheaper but has 24-hour turnaround. Not suitable for real-time audits.

**C. Cache Results**
- Cache business detection by domain
- Cache tech stack detection (rarely changes)
- TTL: 7 days for business info, 1 day for technical

**Expected Improvement:** 40-50% reduction in Claude time

---

### 3. **Branded Keyword Discovery** ⏱️ MODERATE BOTTLENECK
**Issue:** Generates 100+ keyword variations, rejects most
**Impact:** ~30-45 seconds of wasted processing

**Current Flow:**
```
Generate 20 seed keywords
→ Keywords Everywhere suggests 100+ variations
→ Filter each variation (brand match, relevance)
→ Reject 95% of suggestions
→ Keep 5-10 keywords
```

**Solution:** Smarter filtering upfront
```typescript
// BEFORE: Filter after API call
const suggestions = await getKeywordSuggestions(seeds) // Returns 100+
const filtered = suggestions.filter(isRelevant) // Keep 5

// AFTER: Request fewer, better seeds
const smartSeeds = generateSmartSeeds(brandName, 5) // Only 5 high-quality
const suggestions = await getKeywordSuggestions(smartSeeds) // Returns 20-30
const filtered = suggestions.filter(isRelevant) // Keep 15
```

**Expected Improvement:** 60% reduction in keyword discovery time

---

### 4. **PageSpeed Insights API** ⏱️ MODERATE BOTTLENECK
**Issue:** Google PageSpeed API is slow (5-10 seconds per call)
**Impact:** 2 calls (desktop + mobile) = 10-20 seconds

**Solutions:**

**A. Run in Parallel**
```typescript
// BEFORE: Sequential
const desktop = await getPageSpeed(url, 'desktop')
const mobile = await getPageSpeed(url, 'mobile')

// AFTER: Parallel
const [desktop, mobile] = await Promise.all([
  getPageSpeed(url, 'desktop'),
  getPageSpeed(url, 'mobile')
])
```

**B. Cache Results**
- PageSpeed data doesn't change frequently
- Cache for 6 hours
- Reduces repeat audit cost

**Expected Improvement:** 50% reduction (already doing parallel in some places)

---

### 5. **Multiple Tech Stack Detections** ⏱️ MINOR BOTTLENECK
**Issue:** Tech stack detected 3 times in one audit
**Impact:** ~5-10 seconds wasted

**Locations:**
1. Traffic section
2. Performance section
3. Technology analysis

**Solution:** Detect once, share result
```typescript
// Run once at start
const techStack = await detectTechStack(url)

// Pass to all sections
const traffic = await getTraffic(url, { techStack })
const performance = await getPerformance(url, { techStack })
```

**Expected Improvement:** 5-10 seconds saved

---

### 6. **localStorage on Server** ❌ CRITICAL BUG
**Issue:** `localStorage` doesn't exist on server-side
**Impact:** Breaks usage tracking, throws errors

**Solution:** Use server-side storage
```typescript
// BEFORE (Client-only)
localStorage.setItem('usage', JSON.stringify(data))

// AFTER (Server-side)
// Option 1: Database
await prisma.claudeUsage.create({ data })

// Option 2: File system
await fs.writeFile('/tmp/usage.json', JSON.stringify(data))

// Option 3: Memory (simple)
const usageCache = new Map()
usageCache.set('usage', data)
```

**Expected Improvement:** Fix errors, enable proper usage tracking

---

## Performance Optimization Priority

### High Priority (Implement First)
1. **Run sections in parallel** - 60-70% improvement
2. **Combine Claude API calls** - 40-50% improvement
3. **Fix localStorage issue** - Critical bug fix

### Medium Priority
4. **Optimize keyword discovery** - 60% improvement in keywords section
5. **Cache PageSpeed results** - 50% improvement
6. **Deduplicate tech stack detection** - 5-10 seconds saved

### Low Priority (Nice to Have)
7. **Implement Redis caching** - For multi-user performance
8. **Add request queuing** - Prevent API rate limits
9. **Use CDN for static analysis** - Offload repeated work

---

## Expected Overall Improvement

**Current:** 2.5-4.5 minutes per audit

**After High Priority Fixes:**
- Parallel sections: 4.5min → 1.8min (60% reduction)
- Combined Claude calls: 1.8min → 1.1min (40% reduction)

**Final:** ~1-1.5 minutes per audit

**Speed Improvement: 65-75% faster** 🚀

---

## Implementation Recommendations

### Phase 1: Quick Wins (1-2 hours)
1. Run sections in parallel
2. Fix localStorage issue
3. Deduplicate tech stack detection

### Phase 2: API Optimization (2-3 hours)
4. Combine Claude API calls
5. Add PageSpeed caching
6. Optimize keyword discovery

### Phase 3: Advanced (Future)
7. Implement Redis
8. Add request queuing
9. CDN integration

---

## Code Changes Required

### app/api/audit/route.ts
```typescript
// Change from:
for (const section of sections) {
  await processSection(section)
}

// To:
const sectionPromises = sections.map(section => processSection(section))
await Promise.all(sectionPromises)
```

### lib/claudeApiService.ts
```typescript
// Add combined analysis method
async analyzeWebsiteComplete(domain: string, html: string) {
  return await this.callClaude({
    prompt: `Analyze this website for:
    1. Business type and keywords
    2. Performance issues
    3. Technical SEO
    4. Image optimization
    5. Technology stack

    Return comprehensive JSON...`
  })
}
```

### lib/enhancedKeywordService.ts
```typescript
// Reduce keyword seed generation
generateSmartSeeds(brandName: string) {
  return [
    `${brandName}`,
    `${brandName} reviews`,
    `${brandName} near me`,
    `${brandName} contact`,
    `${brandName} services`
  ] // Just 5 instead of 20
}
```

---

## Monitoring & Metrics

Add performance tracking:
```typescript
const startTime = Date.now()

// Track each section
console.time('traffic-section')
await processTraffic()
console.timeEnd('traffic-section')

// Track total
const totalTime = Date.now() - startTime
await prisma.audit.update({
  where: { id },
  data: {
    processingTimeMs: totalTime,
    performanceMetrics: {
      traffic: trafficTime,
      performance: performanceTime,
      keywords: keywordsTime
    }
  }
})
```

---

## Summary

**Main Bottleneck:** Sequential processing + Multiple Claude calls

**Quick Fix:** Parallelize sections (60% faster in 30 minutes of work)

**Best ROI:** Combine Phases 1 & 2 (75% faster in 3-5 hours of work)

**Production Ready:** All recommendations are safe for production deployment
